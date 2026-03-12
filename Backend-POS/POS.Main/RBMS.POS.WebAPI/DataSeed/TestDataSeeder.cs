using Microsoft.EntityFrameworkCore;
using POS.Main.Core.Enums;
using POS.Main.Core.Helpers;
using POS.Main.Dal;
using POS.Main.Dal.Entities;

namespace RBMS.POS.WebAPI.DataSeed;

/// <summary>
/// Seeds admin user + employee (Development only) — only if no admin exists
/// </summary>
public static class TestDataSeeder
{
    public static async Task SeedTestUsersAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<POSMainContext>();

        // Skip if admin user already exists
        var adminExists = await context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Username == "Admin");

        if (adminExists) return;

        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var now = DateTime.UtcNow;
        var adminUserId = Guid.NewGuid();

        var adminUser = new TbUser
        {
            UserId = adminUserId,
            Username = "Admin",
            Email = "admin@rbms.com",
            PasswordHash = hasher.HashPassword("P@ssw0rd"),
            IsActive = true,
            CreatedAt = now,
        };

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();

        var adminEmployee = new TbEmployee
        {
            FirstNameThai = "แอดมิน",
            LastNameThai = "ระบบ",
            FirstNameEnglish = "Admin",
            LastNameEnglish = "System",
            Nickname = "แอดมิน",
            Gender = EGender.NotSpecified,
            StartDate = now,
            EmploymentStatus = EEmploymentStatus.Active,
            PositionId = 1,
            IsActive = true,
            UserId = adminUserId,
            CreatedAt = now,
        };

        context.Employees.Add(adminEmployee);
        await context.SaveChangesAsync();
    }
}
