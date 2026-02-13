package com.incial.crm.service;

import com.incial.crm.entity.Task;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Incial Security");
            helper.setTo(toEmail);
            helper.setSubject("Password Reset OTP");

            helper.setText(buildHtmlOtpTemplate(otp), true);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send premium email", e);
        }
    }

    public void sendTaskAssignmentEmail(String toEmail, Task task, String assignedByName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Incial Task Manager");
            helper.setTo(toEmail);
            helper.setSubject("🎯 New Task Assigned: " + task.getTitle());

            helper.setText(buildHtmlTaskAssignmentTemplate(task, assignedByName, toEmail), true);

            mailSender.send(message);
            log.info("Task assignment email sent successfully to: {} for task: {}", toEmail, task.getTitle());

        } catch (Exception e) {
            log.error("Failed to send task assignment email to: {} for task: {}", toEmail, task.getTitle(), e);
            // Don't throw exception - email failure shouldn't block task creation
        }
    }

    private String buildHtmlOtpTemplate(String otp) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Password Reset OTP</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
            <table width="100%%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding:40px 0;">
                        <table width="480" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:12px;padding:32px;
                                      box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                            
                            <tr>
                                <td style="font-size:20px;font-weight:600;color:#111827;">
                                    Password Reset Request
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-top:12px;font-size:14px;color:#374151;line-height:1.6;">
                                    Use the OTP below to reset your password. This code is valid for 10 minutes.
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="padding:28px 0;">
                                    <div style="
                                        display:inline-block;
                                        padding:14px 26px;
                                        font-size:28px;
                                        font-weight:700;
                                        letter-spacing:6px;
                                        color:#111827;
                                        background:#f3f4f6;
                                        border-radius:8px;">
                                        %s
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td style="font-size:13px;color:#6b7280;line-height:1.6;">
                                    If you did not request a password reset, you can safely ignore this email.
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-top:28px;font-size:12px;color:#9ca3af;
                                           border-top:1px solid #e5e7eb;">
                                    © 2025 Incial · Security Notification<br>
                                    Please do not reply to this email.
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """.formatted(otp);
    }

    private String buildHtmlTaskAssignmentTemplate(Task task, String assignedByName, String assigneeEmail) {
        // Format dates
        String dueDate = task.getDueDate() != null ?
                task.getDueDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "No due date";

        // Priority styling
        String priorityColor = getPriorityColor(task.getPriority());
        String priorityBg = getPriorityBackgroundColor(task.getPriority());

        // Task type badge
        String taskType = task.getTaskType() != null ? task.getTaskType() : "General";

        // Description with fallback
        String description = task.getDescription() != null && !task.getDescription().isEmpty() ?
                task.getDescription() : "No additional details provided.";

        // Truncate description if too long
        if (description.length() > 200) {
            description = description.substring(0, 197) + "...";
        }

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>New Task Assignment</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
            <table width="100%%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding:40px 0;">
                        <table width="480" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:12px;padding:32px;
                                      box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                            
                            <!-- Header -->
                            <tr>
                                <td style="font-size:20px;font-weight:600;color:#111827;">
                                    🎯 New Task Assigned
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-top:12px;font-size:14px;color:#374151;line-height:1.6;">
                                    <strong>%s</strong> has assigned you a new task that requires your attention.
                                </td>
                            </tr>

                            <!-- Task Title Section -->
                            <tr>
                                <td style="padding-top:24px;">
                                    <div style="
                                        padding:20px;
                                        background:#f9fafb;
                                        border-radius:8px;
                                        border:1px solid #e5e7eb;">
                                        <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:12px;">
                                            %s
                                        </div>
                                        <div style="margin-bottom:8px;">
                                            <span style="
                                                display:inline-block;
                                                background:%s;
                                                color:%s;
                                                padding:4px 10px;
                                                border-radius:6px;
                                                font-size:11px;
                                                font-weight:700;
                                                text-transform:uppercase;
                                                letter-spacing:0.5px;">
                                                %s Priority
                                            </span>
                                            <span style="
                                                display:inline-block;
                                                background:#e5e7eb;
                                                color:#6b7280;
                                                padding:4px 10px;
                                                border-radius:6px;
                                                font-size:11px;
                                                font-weight:600;
                                                margin-left:6px;">
                                                %s
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            <!-- Description -->
                            <tr>
                                <td style="padding-top:20px;">
                                    <div style="font-size:13px;color:#6b7280;font-weight:600;margin-bottom:8px;">
                                        DESCRIPTION
                                    </div>
                                    <div style="
                                        padding:14px 18px;
                                        background:#f3f4f6;
                                        border-radius:8px;
                                        font-size:14px;
                                        color:#374151;
                                        line-height:1.6;">
                                        %s
                                    </div>
                                </td>
                            </tr>

                            <!-- Task Details -->
                            <tr>
                                <td style="padding-top:24px;">
                                    <table width="100%%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="width:50%%;padding-right:8px;">
                                                <div style="font-size:12px;color:#6b7280;font-weight:600;margin-bottom:6px;">
                                                    📅 DUE DATE
                                                </div>
                                                <div style="font-size:15px;color:#111827;font-weight:600;">
                                                    %s
                                                </div>
                                            </td>
                                            <td style="width:50%%;padding-left:8px;">
                                                <div style="font-size:12px;color:#6b7280;font-weight:600;margin-bottom:6px;">
                                                    📊 STATUS
                                                </div>
                                                <div style="font-size:15px;color:#111827;font-weight:600;">
                                                    %s
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Assigned To -->
                            <tr>
                                <td style="padding-top:24px;font-size:13px;color:#6b7280;line-height:1.6;">
                                    <strong style="color:#111827;">Assigned to:</strong> %s
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-top:8px;font-size:13px;color:#6b7280;line-height:1.6;">
                                    Please review this task and take necessary action. Log in to your account to view full details and update the status.
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding-top:28px;font-size:12px;color:#9ca3af;
                                           border-top:1px solid #e5e7eb;">
                                    © 2026 Incial · Task Management System<br>
                                    Please do not reply to this email.
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """.formatted(
                assignedByName,
                task.getTitle(),
                priorityBg,
                priorityColor,
                task.getPriority() != null ? task.getPriority() : "Medium",
                taskType,
                description,
                dueDate,
                task.getStatus() != null ? task.getStatus() : "Not Started",
                assigneeEmail
        );
    }

    private String getPriorityColor(String priority) {
        if (priority == null) return "#f59e0b";
        return switch (priority.toLowerCase()) {
            case "high" -> "#dc2626";
            case "medium" -> "#f59e0b";
            case "low" -> "#059669";
            default -> "#6b7280";
        };
    }

    private String getPriorityBackgroundColor(String priority) {
        if (priority == null) return "#fef3c7";
        return switch (priority.toLowerCase()) {
            case "high" -> "#fee2e2";
            case "medium" -> "#fef3c7";
            case "low" -> "#d1fae5";
            default -> "#f3f4f6";
        };
    }
}
