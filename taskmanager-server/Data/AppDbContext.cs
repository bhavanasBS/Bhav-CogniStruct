using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models;

namespace TaskManager.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<WorkLog> WorkLogs => Set<WorkLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<DailyUpdateStatus> DailyUpdateStatuses => Set<DailyUpdateStatus>();
    public DbSet<TaskAuditLog> TaskAuditLogs => Set<TaskAuditLog>();
    public DbSet<PauseRequest> PauseRequests => Set<PauseRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── UserRole (many-to-many) ───────────────
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // ─── TeamMember (many-to-many) ─────────────
        modelBuilder.Entity<TeamMember>()
            .HasKey(tm => new { tm.TeamId, tm.UserId });

        modelBuilder.Entity<TeamMember>()
            .HasOne(tm => tm.Team)
            .WithMany(t => t.Members)
            .HasForeignKey(tm => tm.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TeamMember>()
            .HasOne(tm => tm.User)
            .WithMany(u => u.TeamMemberships)
            .HasForeignKey(tm => tm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ─── Team → Manager ────────────────────────
        modelBuilder.Entity<Team>()
            .HasOne(t => t.Manager)
            .WithMany(u => u.ManagedTeams)
            .HasForeignKey(t => t.ManagerId)
            .OnDelete(DeleteBehavior.SetNull);

        // ─── TaskItem ──────────────────────────────
        modelBuilder.Entity<TaskItem>().ToTable("Tasks");

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Assignee)
            .WithMany(u => u.AssignedTasks)
            .HasForeignKey(t => t.AssigneeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Assigner)
            .WithMany(u => u.CreatedTasks)
            .HasForeignKey(t => t.AssignerId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Team)
            .WithMany(tm => tm.Tasks)
            .HasForeignKey(t => t.TeamId)
            .OnDelete(DeleteBehavior.NoAction);

        // ── TaskItem self-referencing hierarchy ──
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.ParentTask)
            .WithMany(t => t.SubTasks)
            .HasForeignKey(t => t.ParentTaskId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.ParentTaskId);

        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.AssigneeId);

        // ─── PauseRequest ──────────────────────────
        modelBuilder.Entity<PauseRequest>()
            .HasOne(p => p.Task)
            .WithMany()
            .HasForeignKey(p => p.TaskId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<PauseRequest>()
            .HasOne(p => p.Employee)
            .WithMany()
            .HasForeignKey(p => p.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<PauseRequest>()
            .HasOne(p => p.RequestedBy)
            .WithMany()
            .HasForeignKey(p => p.RequestedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<PauseRequest>()
            .HasOne(p => p.ApprovedBy)
            .WithMany()
            .HasForeignKey(p => p.ApprovedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        // ─── WorkLog ──────────────────────────────
        modelBuilder.Entity<WorkLog>()
            .HasOne(w => w.Task)
            .WithMany(t => t.WorkLogs)
            .HasForeignKey(w => w.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkLog>()
            .HasOne(w => w.User)
            .WithMany(u => u.WorkLogs)
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // ─── Notification ─────────────────────────
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ─── Indexes ──────────────────────────────
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Role>()
            .HasIndex(r => r.RoleName)
            .IsUnique();

        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.Status);

        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.AssigneeId);

        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.UserId, n.IsRead });

        // ─── UserSettings (one-to-one) ───────────────
        modelBuilder.Entity<UserSettings>()
            .HasOne(us => us.User)
            .WithOne()
            .HasForeignKey<UserSettings>(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserSettings>()
            .HasIndex(us => us.UserId)
            .IsUnique();

        // ─── DailyUpdateStatus ─────────────────────
        modelBuilder.Entity<DailyUpdateStatus>()
            .HasOne(d => d.User)
            .WithMany(u => u.DailyUpdates)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DailyUpdateStatus>()
            .HasOne(d => d.AcknowledgedBy)
            .WithMany()
            .HasForeignKey(d => d.AcknowledgedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<DailyUpdateStatus>()
            .HasIndex(d => new { d.UserId, d.UpdateDate })
            .IsUnique();

        // ─── TaskAuditLog ─────────────────────────────
        modelBuilder.Entity<TaskAuditLog>()
            .HasOne(a => a.Task)
            .WithMany()
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskAuditLog>()
            .HasOne(a => a.PerformedBy)
            .WithMany()
            .HasForeignKey(a => a.PerformedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TaskAuditLog>()
            .HasIndex(a => a.TaskId);
    }
}
