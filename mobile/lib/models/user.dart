class ApplicantProfile {
  final String id;
  final String userId;
  final String? resumeUrl;
  final List<String> skills;
  final String? experience;
  final String? education;
  final String? preferredLocation;
  final int? preferredSalaryMin;
  final int? preferredSalaryMax;

  ApplicantProfile({
    required this.id,
    required this.userId,
    required this.skills,
    this.resumeUrl,
    this.experience,
    this.education,
    this.preferredLocation,
    this.preferredSalaryMin,
    this.preferredSalaryMax,
  });

  factory ApplicantProfile.fromJson(Map<String, dynamic> json) {
    return ApplicantProfile(
      id: json['id'] as String,
      userId: json['userId'] as String,
      resumeUrl: json['resumeUrl'] as String?,
      skills: (json['skills'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      experience: json['experience'] as String?,
      education: json['education'] as String?,
      preferredLocation: json['preferredLocation'] as String?,
      preferredSalaryMin: json['preferredSalaryMin'] is int ? json['preferredSalaryMin'] as int : null,
      preferredSalaryMax: json['preferredSalaryMax'] is int ? json['preferredSalaryMax'] as int : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'resumeUrl': resumeUrl,
      'skills': skills,
      'experience': experience,
      'education': education,
      'preferredLocation': preferredLocation,
      'preferredSalaryMin': preferredSalaryMin,
      'preferredSalaryMax': preferredSalaryMax,
    };
  }
}

class RecruiterProfile {
  final String id;
  final String userId;
  final String companyName;
  final String? companyDescription;
  final String? website;
  final String? industry;

  RecruiterProfile({
    required this.id,
    required this.userId,
    required this.companyName,
    this.companyDescription,
    this.website,
    this.industry,
  });

  factory RecruiterProfile.fromJson(Map<String, dynamic> json) {
    return RecruiterProfile(
      id: json['id'] as String,
      userId: json['userId'] as String,
      companyName: json['companyName'] as String,
      companyDescription: json['companyDescription'] as String?,
      website: json['website'] as String?,
      industry: json['industry'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'companyName': companyName,
      'companyDescription': companyDescription,
      'website': website,
      'industry': industry,
    };
  }
}

class User {
  final String id;
  final String email;
  final String role;
  final String firstName;
  final String lastName;
  final String? phone;
  final bool isVerified;
  final bool isPaid;
  final String? profileImageUrl;
  final String? createdAt;
  final String? updatedAt;
  final ApplicantProfile? applicantProfile;
  final RecruiterProfile? recruiterProfile;

  User({
    required this.id,
    required this.email,
    required this.role,
    required this.firstName,
    required this.lastName,
    required this.isVerified,
    required this.isPaid,
    this.phone,
    this.profileImageUrl,
    this.createdAt,
    this.updatedAt,
    this.applicantProfile,
    this.recruiterProfile,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      phone: json['phone'] as String?,
      isVerified: json['isVerified'] as bool,
      isPaid: json['isPaid'] as bool,
      profileImageUrl: json['profileImageUrl'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
      applicantProfile: json['applicantProfile'] != null
          ? ApplicantProfile.fromJson(json['applicantProfile'] as Map<String, dynamic>)
          : null,
      recruiterProfile: json['recruiterProfile'] != null
          ? RecruiterProfile.fromJson(json['recruiterProfile'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'role': role,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'isVerified': isVerified,
      'isPaid': isPaid,
      'profileImageUrl': profileImageUrl,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'applicantProfile': applicantProfile?.toJson(),
      'recruiterProfile': recruiterProfile?.toJson(),
    };
  }
}
