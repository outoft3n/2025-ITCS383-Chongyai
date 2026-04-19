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
}
