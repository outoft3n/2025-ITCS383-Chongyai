import 'application.dart';

class Interview {
  final String id;
  final String applicationId;
  final String scheduledAt;
  final int duration;
  final String type;
  final String status;
  final String? notes;
  final String? conferenceId;
  final String createdAt;
  final String updatedAt;
  final Application? application;

  Interview({
    required this.id,
    required this.applicationId,
    required this.scheduledAt,
    required this.duration,
    required this.type,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.notes,
    this.conferenceId,
    this.application,
  });

  factory Interview.fromJson(Map<String, dynamic> json) {
    return Interview(
      id: json['id'] as String,
      applicationId: json['applicationId'] as String,
      scheduledAt: json['scheduledAt'] as String,
      duration: json['duration'] as int,
      type: json['type'] as String,
      status: json['status'] as String,
      notes: json['notes'] as String?,
      conferenceId: json['conferenceId'] as String?,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
      application: json['application'] != null ? Application.fromJson(json['application'] as Map<String, dynamic>) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'applicationId': applicationId,
      'scheduledAt': scheduledAt,
      'duration': duration,
      'type': type,
      'status': status,
      'notes': notes,
      'conferenceId': conferenceId,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'application': application?.toJson(),
    };
  }
}
