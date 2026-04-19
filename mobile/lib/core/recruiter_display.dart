/// Backend nests company name under `recruiter.recruiterProfile.companyName` (Prisma select).
String? companyNameFromRecruiterJson(Map<String, dynamic>? recruiter) {
  if (recruiter == null) return null;
  final profile = recruiter['recruiterProfile'];
  if (profile is Map<String, dynamic>) {
    final name = profile['companyName'] as String?;
    if (name != null && name.isNotEmpty) return name;
  }
  final flat = recruiter['companyName'] as String?;
  if (flat != null && flat.isNotEmpty) return flat;
  return null;
}
