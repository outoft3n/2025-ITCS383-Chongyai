import 'package:flutter_test/flutter_test.dart';
import 'package:chongyai_mobile/models/user.dart';

void main() {
  test('User.fromJson works with login response', () {
    // Simulate the backend login response
    final loginResponseData = {
      "id": "cmo3chtlb0005dr09l1v4tfgd",
      "email": "applicant1@email.com",
      "role": "APPLICANT",
      "firstName": "Siriporn",
      "lastName": "Chaiyaporn",
      "phone": null,
      "isVerified": true,
      "isPaid": true,
      "profileImageUrl": null,
      "applicantProfile": null,
      "recruiterProfile": null
    };

    // This should not throw
    final user = User.fromJson(loginResponseData);

    expect(user.id, "cmo3chtlb0005dr09l1v4tfgd");
    expect(user.email, "applicant1@email.com");
    expect(user.role, "APPLICANT");
    expect(user.firstName, "Siriporn");
    expect(user.lastName, "Chaiyaporn");
    expect(user.isVerified, true);
    expect(user.isPaid, true);
    expect(user.createdAt, null);
    expect(user.updatedAt, null);
  });

  test('User.fromJson parses nested profiles and toJson serializes them', () {
    final json = <String, dynamic>{
      'id': 'u-2',
      'email': 'recruiter@email.com',
      'role': 'RECRUITER',
      'firstName': 'Rec',
      'lastName': 'Ruiter',
      'isVerified': false,
      'isPaid': true,
      'applicantProfile': {
        'id': 'ap-1',
        'userId': 'u-2',
        'skills': ['Dart', 'Flutter'],
        'preferredSalaryMin': 30000.0,
      },
      'recruiterProfile': {
        'id': 'rp-1',
        'userId': 'u-2',
        'companyName': 'Cursor Co',
      },
    };

    final user = User.fromJson(json);
    final serialized = user.toJson();

    expect(user.applicantProfile?.preferredSalaryMin, 30000);
    expect(user.recruiterProfile?.companyName, 'Cursor Co');
    expect((serialized['applicantProfile'] as Map<String, dynamic>)['skills'], ['Dart', 'Flutter']);
    expect((serialized['recruiterProfile'] as Map<String, dynamic>)['companyName'], 'Cursor Co');
  });
}
