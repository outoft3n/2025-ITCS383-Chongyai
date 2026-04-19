import 'user.dart';

class Job {
  final String id;
  final String recruiterId;
  final String title;
  final String description;
  final String requirements;
  final String location;
  final String jobType;
  final int? salaryMin;
  final int? salaryMax;
  final List<String> skills;
  final int viewCount;
  final bool isActive;
  final String? expiresAt;
  final String createdAt;
  final String updatedAt;
  final Map<String, dynamic>? recruiter;
  final Map<String, dynamic>? count;
  final int? matchScore;

  Job({
    required this.id,
    required this.recruiterId,
    required this.title,
    required this.description,
    required this.requirements,
    required this.location,
    required this.jobType,
    required this.skills,
    required this.viewCount,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.salaryMin,
    this.salaryMax,
    this.expiresAt,
    this.recruiter,
    this.count,
    this.matchScore,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] as String,
      recruiterId: json['recruiterId'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      requirements: json['requirements'] as String,
      location: json['location'] as String,
      jobType: json['jobType'] as String,
      salaryMin: json['salaryMin'] is int ? json['salaryMin'] as int : null,
      salaryMax: json['salaryMax'] is int ? json['salaryMax'] as int : null,
      skills: (json['skills'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      viewCount: json['viewCount'] as int,
      isActive: json['isActive'] as bool,
      expiresAt: json['expiresAt'] as String?,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
      recruiter: json['recruiter'] as Map<String, dynamic>?,
      count: json['_count'] as Map<String, dynamic>?,
      matchScore: json['matchScore'] is int ? json['matchScore'] as int : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'recruiterId': recruiterId,
      'title': title,
      'description': description,
      'requirements': requirements,
      'location': location,
      'jobType': jobType,
      'salaryMin': salaryMin,
      'salaryMax': salaryMax,
      'skills': skills,
      'viewCount': viewCount,
      'isActive': isActive,
      'expiresAt': expiresAt,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'recruiter': recruiter,
      '_count': count,
      'matchScore': matchScore,
    };
  }
}
