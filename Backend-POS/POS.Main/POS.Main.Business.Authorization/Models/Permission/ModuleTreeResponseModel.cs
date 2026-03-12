namespace POS.Main.Business.Authorization.Models.Permission;

public class ModuleTreeResponseModel
{
    public List<ModuleNode> Modules { get; set; } = new();
}

public class ModuleNode
{
    public int ModuleId { get; set; }
    public string ModuleName { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<ChildModuleNode> Children { get; set; } = new();
}

public class ChildModuleNode
{
    public int ModuleId { get; set; }
    public string ModuleName { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<PermissionItem> Permissions { get; set; } = new();
}

public class PermissionItem
{
    public int AuthorizeMatrixId { get; set; }
    public string PermissionPath { get; set; } = string.Empty;
    public string PermissionName { get; set; } = string.Empty;
    public string PermissionCode { get; set; } = string.Empty;
}
