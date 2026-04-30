import 'package:chongyai_mobile/models/application.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Application.fromJson maps nested job and applicant', () {
    final json = <String, dynamic>{
      'id': 'app-1',
      'applicantId': 'user-1',
      'jobId': 'job-1',
      'status': 'PENDING',
      'coverLetter': 'Interested in this role',
      'createdAt': '2026-04-19T10:00:00.000Z',
      'updatedAt': '2026-04-19T10:10:00.000Z',
      'job': {
        'id': 'job-1',
        'recruiterId': 'rec-1',
        'title': 'Backend Developer',
        'description': 'Build APIs',
        'requirements': 'Node.js',
        'location': 'Chiang Mai',
        'jobType': 'FULL_TIME',
        'skills': ['Node.js'],
        'viewCount': 7,
        'isActive': true,
        'createdAt': '2026-04-19T09:00:00.000Z',
        'updatedAt': '2026-04-19T09:00:00.000Z',
      },
      'applicant': {
        'id': 'user-1',
        'email': 'applicant@email.com',
        'role': 'APPLICANT',
        'firstName': 'A',
        'lastName': 'B',
        'isVerified': true,
        'isPaid': false,
      },
    };

    final application = Application.fromJson(json);

    expect(application.id, 'app-1');
    expect(application.status, 'PENDING');
    expect(application.job?.title, 'Backend Developer');
    expect(application.applicant?.email, 'applicant@email.com');
  });

  test('Application.toJson keeps nullable nested fields when absent', () {
    final json = <String, dynamic>{
      'id': 'app-2',
      'applicantId': 'user-2',
      'jobId': 'job-2',
      'status': 'ACCEPTED',
      'createdAt': '2026-04-19T10:00:00.000Z',
      'updatedAt': '2026-04-19T10:10:00.000Z',
      'job': null,
      'applicant': null,
    };

    final application = Application.fromJson(json);
    final serialized = application.toJson();

    expect(application.coverLetter, isNull);
    expect(application.job, isNull);
    expect(application.applicant, isNull);
    expect(serialized['job'], isNull);
    expect(serialized['applicant'], isNull);
  });
}
