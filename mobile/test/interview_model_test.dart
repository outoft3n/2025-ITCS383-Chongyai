import 'package:chongyai_mobile/models/interview.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Interview.fromJson parses nested application and toJson keeps fields', () {
    final json = <String, dynamic>{
      'id': 'int-1',
      'applicationId': 'app-1',
      'scheduledAt': '2026-05-01T10:00:00.000Z',
      'duration': 45,
      'type': 'VIDEO',
      'status': 'SCHEDULED',
      'notes': 'Bring portfolio',
      'conferenceId': 'room-abc',
      'createdAt': '2026-04-30T10:00:00.000Z',
      'updatedAt': '2026-04-30T11:00:00.000Z',
      'application': {
        'id': 'app-1',
        'applicantId': 'user-1',
        'jobId': 'job-1',
        'status': 'PENDING',
        'createdAt': '2026-04-30T09:00:00.000Z',
        'updatedAt': '2026-04-30T09:10:00.000Z',
      },
    };

    final interview = Interview.fromJson(json);
    final serialized = interview.toJson();

    expect(interview.id, 'int-1');
    expect(interview.duration, 45);
    expect(interview.application?.id, 'app-1');
    expect(serialized['conferenceId'], 'room-abc');
    expect((serialized['application'] as Map<String, dynamic>)['id'], 'app-1');
  });

  test('Interview.fromJson defaults duration when value is missing', () {
    final json = <String, dynamic>{
      'id': 'int-2',
      'applicationId': 'app-2',
      'scheduledAt': '2026-05-01T10:00:00.000Z',
      'type': 'PHONE',
      'status': 'PENDING',
      'createdAt': '2026-04-30T10:00:00.000Z',
      'updatedAt': '2026-04-30T11:00:00.000Z',
    };

    final interview = Interview.fromJson(json);

    expect(interview.duration, 60);
    expect(interview.application, isNull);
    expect(interview.notes, isNull);
  });
}
