import 'package:chongyai_mobile/models/job.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Job.fromJson parses values and defaults correctly', () {
    final json = <String, dynamic>{
      'id': 'job-1',
      'recruiterId': 'rec-1',
      'title': 'Flutter Developer',
      'description': 'Build mobile app',
      'requirements': 'Dart, Flutter',
      'location': 'Bangkok',
      'skills': ['Flutter', 'Dart'],
      'createdAt': '2026-04-19T10:00:00.000Z',
      'updatedAt': '2026-04-19T10:00:00.000Z',
    };

    final job = Job.fromJson(json);

    expect(job.id, 'job-1');
    expect(job.jobType, 'FULL_TIME');
    expect(job.viewCount, 0);
    expect(job.isActive, true);
    expect(job.skills, ['Flutter', 'Dart']);
  });

  test('Job.fromJson converts number types and toJson keeps optional fields', () {
    final json = <String, dynamic>{
      'id': 'job-2',
      'recruiterId': 'rec-2',
      'title': 'Backend Engineer',
      'description': 'APIs',
      'requirements': 'Node',
      'location': 'Remote',
      'salaryMin': 20000.2,
      'salaryMax': '50000',
      'skills': <String>[],
      'viewCount': 4.2,
      'isActive': false,
      'expiresAt': '2026-12-31T00:00:00.000Z',
      'createdAt': '2026-04-19T10:00:00.000Z',
      'updatedAt': '2026-04-19T10:00:00.000Z',
      '_count': {'applications': 3},
      'matchScore': '98',
    };

    final job = Job.fromJson(json);
    final serialized = job.toJson();

    expect(job.salaryMin, 20000);
    expect(job.salaryMax, 50000);
    expect(job.viewCount, 4);
    expect(job.isActive, false);
    expect(job.matchScore, 98);
    expect(serialized['_count'], {'applications': 3});
  });
}
