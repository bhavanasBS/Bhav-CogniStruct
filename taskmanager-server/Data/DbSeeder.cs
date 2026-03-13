using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models;
using BCrypt.Net;

namespace TaskManager.API.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        // ─── Roles (always ensure roles exist) ─────────────────
        if (!db.Roles.Any())
        {
            var roles = new List<Role>
            {
                new() { RoleName = "Admin", Description = "Full system control — user CRUD, role assignment, system configuration" },
                new() { RoleName = "Manager", Description = "Team management, task assignment, view team analytics, approve time logs" },
                new() { RoleName = "TeamLead", Description = "Assign tasks within team, view team progress, limited reporting" },
                new() { RoleName = "Employee", Description = "View assigned tasks, log work hours, update task status" },
            };
            db.Roles.AddRange(roles);
            db.SaveChanges();
        }

        // ─── Default Admin (ensure at least one admin exists) ──
        if (!db.Users.Any(u => u.UserRoles.Any(ur => ur.Role.RoleName == "Admin")))
        {
            var hash = BCrypt.Net.BCrypt.HashPassword("Password@123");
            var adminUser = new User
            {
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@cognistruct.com",
                PasswordHash = hash,
                IsActive = true,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            db.Users.Add(adminUser);
            db.SaveChanges();

            var adminRole = db.Roles.First(r => r.RoleName == "Admin");
            db.UserRoles.Add(new UserRole { UserId = adminUser.UserId, RoleId = adminRole.RoleId });
            db.SaveChanges();
        }
    }
}
