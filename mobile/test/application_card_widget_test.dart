import 'package:chongyai_mobile/models/application.dart';
import 'package:chongyai_mobile/widgets/application_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Application _application() => Application.fromJson({
      'id': 'app-1',
      'applicantId': 'user-1',
      'jobId': 'job-1',
      'status': 'APPLIED',
      'coverLetter': 'I am excited',
      'createdAt': '2026-04-19T10:00:00.000Z',
      'updatedAt': '2026-04-19T10:10:00.000Z',
      'job': {
        'id': 'job-1',
        'recruiterId': 'rec-1',
        'title': 'Backend Developer',
        'description': 'Build APIs',
        'requirements': 'Node.js',
        'location': 'Chiang Mai',
        'skills': ['Node.js'],
        'createdAt': '2026-04-19T09:00:00.000Z',
        'updatedAt': '2026-04-19T09:00:00.000Z',
        'recruiter': {
          'recruiterProfile': {'companyName': 'Tech Corp'},
        },
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
    });

void main() {
  testWidgets('ApplicationCard renders applicant, company and actions', (tester) async {
    var scheduled = false;
    String? changedId;
    String? changedStatus;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ApplicationCard(
            application: _application(),
            showApplicant: true,
            showViewProfile: true,
            showScheduleInterview: true,
            onScheduleInterview: () => scheduled = true,
            onStatusChange: (id, status) {
              changedId = id;
              changedStatus = status;
            },
          ),
        ),
      ),
    );

    expect(find.text('Backend Developer'), findsOneWidget);
    expect(find.text('Tech Corp'), findsOneWidget);
    expect(find.textContaining('Applicant: A B'), findsOneWidget);
    expect(find.text('View Profile'), findsOneWidget);
    expect(find.text('Schedule Interview'), findsOneWidget);

    await tester.tap(find.text('Schedule Interview'));
    await tester.pumpAndSettle();
    expect(scheduled, isTrue);

    await tester.tap(find.byType(DropdownButton<String>));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Accepted').last);
    await tester.pumpAndSettle();

    expect(changedId, 'app-1');
    expect(changedStatus, 'ACCEPTED');
  });
}
