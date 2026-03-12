namespace POS.Main.Business.Authorization.Models.Permission;

public class PermissionMatrixResponseModel
{
    public int PositionId { get; set; }
    public string PositionName { get; set; } = string.Empty;
    public List<int> GrantedAuthorizeMatrixIds { get; set; } = new();
    public ModuleTreeResponseModel ModuleTree { get; set; } = new();
}
