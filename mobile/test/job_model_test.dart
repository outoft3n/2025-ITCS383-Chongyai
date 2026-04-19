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
}
