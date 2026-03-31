namespace POS.Main.Core.Helpers;

public static class DateTimeHelper
{
    private static readonly TimeZoneInfo ThaiTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

    public static DateTime BangkokNow() =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ThaiTimeZone);

    public static DateTime BangkokToday() =>
        BangkokNow().Date;
}
