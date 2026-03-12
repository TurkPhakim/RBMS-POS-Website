namespace POS.Main.Core.Models;

public class PaginationModel
{
    public int Page { get; set; } = 1;

    public int ItemPerPage { get; set; } = 10;

    public string? Search { get; set; }

    public string? OrderBy { get; set; }

    public bool IsDescending { get; set; } = false;

    public int Skip => (Page - 1) * ItemPerPage;

    public int Take => ItemPerPage;
}
