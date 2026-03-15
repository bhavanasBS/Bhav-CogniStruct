using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models;

namespace TaskManager.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<WorkLog> WorkLogs => Set<WorkLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<TaskAuditLog> TaskAuditLogs => Set<TaskAuditLog>();
    public DbSet<PauseRequest> PauseRequests => Set<PauseRequest>();
    public DbSet<TaskAttachment> TaskAttachments => Set<TaskAttachment>();
    public DbSet<TaskFeedback> TaskFeedbacks => Set<TaskFeedback>();
    public DbSet<EmployeeReview> EmployeeReviews => Set<EmployeeReview>();
    public DbSet<TaskComment> TaskComments => Set<TaskComment>();
    public DbSet<TrainingRequest> TrainingRequests => Set<TrainingRequest>();
    public DbSet<SkillUsage> SkillUsages => Set<SkillUsage>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();

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

        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.UserId, n.CreatedDate });

        // ─── UserSettings (one-to-one) ───────────────
        modelBuilder.Entity<UserSettings>()
            .HasOne(us => us.User)
            .WithOne()
            .HasForeignKey<UserSettings>(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserSettings>()
            .HasIndex(us => us.UserId)
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

        // ─── TaskAttachment ───────────────────────────────
        modelBuilder.Entity<TaskAttachment>()
            .HasOne(a => a.Task)
            .WithMany()
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskAttachment>()
            .HasOne(a => a.UploadedBy)
            .WithMany()
            .HasForeignKey(a => a.UploadedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TaskAttachment>()
            .HasIndex(a => a.TaskId);

        // ─── Additional Indexes ──────────────────────────
        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.Deadline);

        // ─── TaskFeedback ───────────────────────────────
        modelBuilder.Entity<TaskFeedback>()
            .HasOne(f => f.Task)
            .WithMany()
            .HasForeignKey(f => f.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskFeedback>()
            .HasOne(f => f.Employee)
            .WithMany()
            .HasForeignKey(f => f.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TaskFeedback>()
            .HasOne(f => f.TeamLead)
            .WithMany()
            .HasForeignKey(f => f.TeamLeadId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TaskFeedback>()
            .HasIndex(f => f.TaskId)
            .IsUnique(); // one feedback per task

        modelBuilder.Entity<TaskFeedback>()
            .HasIndex(f => f.EmployeeId);

        // ─── EmployeeReview ─────────────────────────────
        modelBuilder.Entity<EmployeeReview>()
            .HasOne(r => r.Employee)
            .WithMany()
            .HasForeignKey(r => r.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EmployeeReview>()
            .HasOne(r => r.Manager)
            .WithMany()
            .HasForeignKey(r => r.ManagerId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EmployeeReview>()
            .HasIndex(r => new { r.EmployeeId, r.ReviewPeriod })
            .IsUnique(); // one review per employee per period

        // ─── Project ──────────────────────────────────
        modelBuilder.Entity<Project>()
            .HasOne(p => p.CreatedByManager)
            .WithMany()
            .HasForeignKey(p => p.CreatedByManagerId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.Lead)
            .WithMany()
            .HasForeignKey(p => p.LeadId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Project>()
            .HasIndex(p => p.CreatedByManagerId);

        // ─── Project → Team ──────────────────────────
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Team)
            .WithMany(t => t.Projects)
            .HasForeignKey(p => p.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        // ─── ProjectMember (many-to-many) ─────────────
        modelBuilder.Entity<ProjectMember>()
            .HasKey(pm => new { pm.ProjectId, pm.UserId });

        modelBuilder.Entity<ProjectMember>()
            .HasOne(pm => pm.Project)
            .WithMany(p => p.Members)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectMember>()
            .HasOne(pm => pm.User)
            .WithMany()
            .HasForeignKey(pm => pm.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // ─── TaskItem → Project ───────────────────────
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.ProjectId);

        // ─── Team → Manager ──────────────────────────
        modelBuilder.Entity<Team>()
            .HasOne(t => t.Manager)
            .WithMany(u => u.ManagedTeams)
            .HasForeignKey(t => t.ManagerId)
            .OnDelete(DeleteBehavior.SetNull);

        // ─── TeamMember (many-to-many) ───────────────
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
    }
}
