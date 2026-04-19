class Invitation {
  final String id;
  final String recruiterId;
  final String applicantId;
  final String jobId;
  final String? message;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? recruiter;
  final Map<String, dynamic>? applicant;
  final Map<String, dynamic>? job;

  Invitation({
    required this.id,
    required this.recruiterId,
    required this.applicantId,
    required this.jobId,
    this.message,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.recruiter,
    this.applicant,
    this.job,
  });

  factory Invitation.fromJson(Map<String, dynamic> json) {
    return Invitation(
      id: json['id'] as String,
      recruiterId: json['recruiterId'] as String,
      applicantId: json['applicantId'] as String,
      jobId: json['jobId'] as String,
      message: json['message'] as String?,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      recruiter: json['recruiter'] as Map<String, dynamic>?,
      applicant: json['applicant'] as Map<String, dynamic>?,
      job: json['job'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'recruiterId': recruiterId,
      'applicantId': applicantId,
      'jobId': jobId,
      'message': message,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'recruiter': recruiter,
      'applicant': applicant,
      'job': job,
    };
  }
}