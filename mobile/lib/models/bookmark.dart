import 'job.dart';

class Bookmark {
  final String id;
  final String applicantId;
  final String jobId;
  final String createdAt;
  final Job? job;

  Bookmark({
    required this.id,
    required this.applicantId,
    required this.jobId,
    required this.createdAt,
    this.job,
  });

  factory Bookmark.fromJson(Map<String, dynamic> json) {
    return Bookmark(
      id: json['id'] as String,
      applicantId: json['applicantId'] as String,
      jobId: json['jobId'] as String,
      createdAt: json['createdAt'] as String,
      job: json['job'] != null ? Job.fromJson(json['job'] as Map<String, dynamic>) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'applicantId': applicantId,
      'jobId': jobId,
      'createdAt': createdAt,
      'job': job?.toJson(),
    };
  }
}
