import 'package:chongyai_mobile/models/invitation.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Invitation fromJson/toJson keeps important fields', () {
    final json = <String, dynamic>{
      'id': 'inv-1',
      'recruiterId': 'rec-1',
      'applicantId': 'app-1',
      'jobId': 'job-1',
      'message': 'Please join interview',
      'status': 'PENDING',
      'createdAt': '2026-04-19T10:00:00.000Z',
      'updatedAt': '2026-04-19T11:00:00.000Z',
      'recruiter': {'companyName': 'Tech Corp'},
      'applicant': {'email': 'applicant@email.com'},
      'job': {'title': 'QA Engineer'},
    };

    final invitation = Invitation.fromJson(json);
    final serialized = invitation.toJson();

    expect(invitation.id, 'inv-1');
    expect(invitation.status, 'PENDING');
    expect(invitation.recruiter?['companyName'], 'Tech Corp');
    expect(serialized['jobId'], 'job-1');
    expect(serialized['message'], 'Please join interview');
  });
}
