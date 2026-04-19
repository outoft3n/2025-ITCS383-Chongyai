import 'job.dart';
import 'user.dart';

class Application {
  final String id;
  final String applicantId;
  final String jobId;
  final String status;
  final String? coverLetter;
  final String createdAt;
  final String updatedAt;
  final Job? job;
  final User? applicant;

  Application({
    required this.id,
    required this.applicantId,
    required this.jobId,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.coverLetter,
    this.job,
    this.applicant,
  });

  factory Application.fromJson(Map<String, dynamic> json) {
    return Application(
      id: json['id'] as String,
      applicantId: json['applicantId'] as String,
      jobId: json['jobId'] as String,
      status: json['status'] as String,
      coverLetter: json['coverLetter'] as String?,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
      job: json['job'] != null ? Job.fromJson(json['job'] as Map<String, dynamic>) : null,
      applicant: json['applicant'] != null ? User.fromJson(json['applicant'] as Map<String, dynamic>) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'applicantId': applicantId,
      'jobId': jobId,
      'status': status,
      'coverLetter': coverLetter,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'job': job?.toJson(),
      'applicant': applicant?.toJson(),
    };
  }
}
