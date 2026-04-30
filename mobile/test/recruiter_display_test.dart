import 'package:chongyai_mobile/core/recruiter_display.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('companyNameFromRecruiterJson reads nested recruiterProfile first', () {
    final recruiter = <String, dynamic>{
      'recruiterProfile': {'companyName': 'Nested Co'},
      'companyName': 'Flat Co',
    };

    expect(companyNameFromRecruiterJson(recruiter), 'Nested Co');
  });

  test('companyNameFromRecruiterJson falls back to flat field', () {
    final recruiter = <String, dynamic>{
      'recruiterProfile': {'companyName': ''},
      'companyName': 'Flat Co',
    };

    expect(companyNameFromRecruiterJson(recruiter), 'Flat Co');
  });

  test('companyNameFromRecruiterJson returns null when no usable name', () {
    expect(companyNameFromRecruiterJson(null), isNull);
    expect(companyNameFromRecruiterJson(<String, dynamic>{}), isNull);
  });
}
