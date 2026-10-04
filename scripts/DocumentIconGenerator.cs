using System;
using System.IO;
using System.Runtime.InteropServices;

public static class DocumentIconGenerator
{
    private const uint GIL_SIMULATEDOC = 1;
    // FileIconInit is exported by ordinal 660, as documented by Microsoft:
    // https://learn.microsoft.com/en-us/windows/win32/shell/fileiconinit
    private const string FILE_ICON_INIT_ENTRY_POINT = "#660";

    [StructLayout(LayoutKind.Sequential)]
    private struct IconInfo
    {
        [MarshalAs(UnmanagedType.Bool)] public bool IsIcon;
        public uint HotspotX;
        public uint HotspotY;
        public IntPtr Mask;
        public IntPtr Color;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Bitmap
    {
        public int Type;
        public int Width;
        public int Height;
        public int WidthBytes;
        public ushort Planes;
        public ushort BitsPixel;
        public IntPtr Bits;
    }

    [DllImport("shell32.dll", EntryPoint = FILE_ICON_INIT_ENTRY_POINT)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool FileIconInit(
        [MarshalAs(UnmanagedType.Bool)] bool restoreCache);

    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    private static extern int SHDefExtractIconW(string file, int index, uint flags,
        out IntPtr largeIcon, IntPtr smallIcon, uint size);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetIconInfo(IntPtr icon, out IconInfo info);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool DestroyIcon(IntPtr icon);

    [DllImport("user32.dll")]
    private static extern IntPtr GetDC(IntPtr window);

    [DllImport("user32.dll")]
    private static extern int ReleaseDC(IntPtr window, IntPtr dc);

    [DllImport("gdi32.dll", EntryPoint = "GetObjectW")]
    private static extern int GetObject(IntPtr bitmap, int size, out Bitmap info);

    [DllImport("gdi32.dll")]
    private static extern int GetDIBits(IntPtr dc, IntPtr bitmap, uint firstLine,
        uint lineCount, [Out] byte[] pixels, [In, Out] byte[] info, uint usage);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool DeleteObject(IntPtr handle);

    public static void GenerateDocumentIcon(string sourcePath, string destinationPath)
    {
        if (!FileIconInit(true))
            throw new InvalidOperationException("Cannot initialize the system image list.");

        int[] sizes = { 16, 32, 48, 64, 128, 256 };
        byte[][] frames = new byte[sizes.Length][];
        for (int i = 0; i < sizes.Length; i++)
        {
            IntPtr icon;
            int result = SHDefExtractIconW(sourcePath, 0, GIL_SIMULATEDOC,
                out icon, IntPtr.Zero, (uint)sizes[i]);
            if (result != 0 || icon == IntPtr.Zero)
                throw new InvalidOperationException("Document icon extraction failed at " + sizes[i] + "px: " + result);
            try
            {
                frames[i] = ReadIcon(icon, sizes[i]);
            }
            finally
            {
                DestroyIcon(icon);
            }
        }

        using (BinaryWriter writer = new BinaryWriter(File.Create(destinationPath)))
        {
            writer.Write((ushort)0);
            writer.Write((ushort)1);
            writer.Write((ushort)sizes.Length);
            uint offset = (uint)(6 + sizes.Length * 16);
            for (int i = 0; i < sizes.Length; i++)
            {
                writer.Write((byte)(sizes[i] == 256 ? 0 : sizes[i]));
                writer.Write((byte)(sizes[i] == 256 ? 0 : sizes[i]));
                writer.Write((byte)0);
                writer.Write((byte)0);
                writer.Write((ushort)1);
                writer.Write((ushort)32);
                writer.Write((uint)frames[i].Length);
                writer.Write(offset);
                offset += (uint)frames[i].Length;
            }
            foreach (byte[] frame in frames)
                writer.Write(frame);
        }
    }

    private static byte[] ReadIcon(IntPtr icon, int size)
    {
        IconInfo info;
        if (!GetIconInfo(icon, out info))
            throw new InvalidOperationException("Cannot read document icon.");
        try
        {
            Bitmap bitmap;
            if (GetObject(info.Color, Marshal.SizeOf(typeof(Bitmap)), out bitmap) == 0 ||
                bitmap.Width != size || bitmap.Height != size)
                throw new InvalidOperationException("Unexpected document icon dimensions.");

            IntPtr dc = GetDC(IntPtr.Zero);
            if (dc == IntPtr.Zero)
                throw new InvalidOperationException("Cannot acquire a device context.");
            try
            {
                byte[] color = new byte[size * size * 4];
                int maskStride = ((size + 31) / 32) * 4;
                byte[] mask = new byte[maskStride * size];
                byte[] colorInfo = BitmapHeader(size, 32, color.Length);
                byte[] maskInfo = BitmapHeader(size, 1, mask.Length);
                if (GetDIBits(dc, info.Color, 0, (uint)size, color, colorInfo, 0) != size ||
                    GetDIBits(dc, info.Mask, 0, (uint)size, mask, maskInfo, 0) != size)
                    throw new InvalidOperationException("Cannot read document icon pixels.");

                bool hasAlpha = false;
                for (int i = 3; i < color.Length; i += 4)
                    hasAlpha |= color[i] != 0;
                if (!hasAlpha)
                {
                    for (int y = 0; y < size; y++)
                        for (int x = 0; x < size; x++)
                            color[(y * size + x) * 4 + 3] =
                                (mask[y * maskStride + x / 8] & (0x80 >> (x % 8))) == 0 ? (byte)255 : (byte)0;
                }

                using (MemoryStream stream = new MemoryStream())
                using (BinaryWriter writer = new BinaryWriter(stream))
                {
                    byte[] header = BitmapHeader(size, 32, color.Length + mask.Length);
                    Array.Copy(BitConverter.GetBytes(size * 2), 0, header, 8, 4);
                    writer.Write(header, 0, 40);
                    writer.Write(color);
                    writer.Write(mask);
                    writer.Flush();
                    return stream.ToArray();
                }
            }
            finally
            {
                ReleaseDC(IntPtr.Zero, dc);
            }
        }
        finally
        {
            if (info.Color != IntPtr.Zero) DeleteObject(info.Color);
            if (info.Mask != IntPtr.Zero) DeleteObject(info.Mask);
        }
    }

    private static byte[] BitmapHeader(int size, ushort bitCount, int imageSize)
    {
        byte[] header = new byte[bitCount == 1 ? 48 : 40];
        Array.Copy(BitConverter.GetBytes(40), 0, header, 0, 4);
        Array.Copy(BitConverter.GetBytes(size), 0, header, 4, 4);
        Array.Copy(BitConverter.GetBytes(size), 0, header, 8, 4);
        Array.Copy(BitConverter.GetBytes((ushort)1), 0, header, 12, 2);
        Array.Copy(BitConverter.GetBytes(bitCount), 0, header, 14, 2);
        Array.Copy(BitConverter.GetBytes(imageSize), 0, header, 20, 4);
        if (bitCount == 1)
        {
            header[44] = 255;
            header[45] = 255;
            header[46] = 255;
        }
        return header;
    }
}
