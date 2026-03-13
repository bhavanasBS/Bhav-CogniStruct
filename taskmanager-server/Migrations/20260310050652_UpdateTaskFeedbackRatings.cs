using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTaskFeedbackRatings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Rating",
                table: "TaskFeedbacks",
                newName: "WorkQualityRating");

            migrationBuilder.RenameColumn(
                name: "Comment",
                table: "TaskFeedbacks",
                newName: "Strengths");

            migrationBuilder.AddColumn<int>(
                name: "CommunicationRating",
                table: "TaskFeedbacks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Improvements",
                table: "TaskFeedbacks",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "OverallRating",
                table: "TaskFeedbacks",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "TimelinessRating",
                table: "TaskFeedbacks",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommunicationRating",
                table: "TaskFeedbacks");

            migrationBuilder.DropColumn(
                name: "Improvements",
                table: "TaskFeedbacks");

            migrationBuilder.DropColumn(
                name: "OverallRating",
                table: "TaskFeedbacks");

            migrationBuilder.DropColumn(
                name: "TimelinessRating",
                table: "TaskFeedbacks");

            migrationBuilder.RenameColumn(
                name: "WorkQualityRating",
                table: "TaskFeedbacks",
                newName: "Rating");

            migrationBuilder.RenameColumn(
                name: "Strengths",
                table: "TaskFeedbacks",
                newName: "Comment");
        }
    }
}
