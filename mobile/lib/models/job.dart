import '../core/json_converters.dart';

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
      id: readString(json['id']),
      recruiterId: readString(json['recruiterId']),
      title: readString(json['title']),
      description: readString(json['description']),
      requirements: readString(json['requirements']),
      location: readString(json['location']),
      jobType: readString(json['jobType'], 'FULL_TIME'),
      salaryMin: readInt(json['salaryMin']),
      salaryMax: readInt(json['salaryMax']),
      skills: (json['skills'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      viewCount: readInt(json['viewCount']) ?? 0,
      isActive: readBool(json['isActive'], true),
      expiresAt: json['expiresAt'] as String?,
      createdAt: readString(json['createdAt']),
      updatedAt: readString(json['updatedAt']),
      recruiter: json['recruiter'] as Map<String, dynamic>?,
      count: json['_count'] as Map<String, dynamic>?,
      matchScore: readInt(json['matchScore']),
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
