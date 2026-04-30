import 'package:chongyai_mobile/core/theme/app_theme.dart';
import 'package:chongyai_mobile/screens/admin/tabs/dashboard_tab.dart';
import 'package:chongyai_mobile/screens/admin/tabs/jobs_tab.dart';
import 'package:chongyai_mobile/screens/admin/tabs/payments_tab.dart';
import 'package:chongyai_mobile/screens/admin/tabs/profile_tab.dart' as admin;
import 'package:chongyai_mobile/screens/admin/tabs/reports_tab.dart';
import 'package:chongyai_mobile/screens/admin/tabs/users_tab.dart';
import 'package:chongyai_mobile/screens/applicant/tabs/applications_tab.dart';
import 'package:chongyai_mobile/screens/applicant/tabs/bookmarks_tab.dart';
import 'package:chongyai_mobile/screens/applicant/tabs/home_tab.dart';
import 'package:chongyai_mobile/screens/applicant/tabs/interviews_tab.dart';
import 'package:chongyai_mobile/screens/applicant/tabs/invitations_tab.dart';
import 'package:chongyai_mobile/screens/applicant/tabs/profile_tab.dart' as applicant;
import 'package:chongyai_mobile/screens/applicant/tabs/search_tab.dart' as applicant;
import 'package:chongyai_mobile/screens/recruiter/tabs/applicants_tab.dart';
import 'package:chongyai_mobile/screens/recruiter/tabs/interviews_tab.dart' as recruiter;
import 'package:chongyai_mobile/screens/recruiter/tabs/invitations_tab.dart' as recruiter;
import 'package:chongyai_mobile/screens/recruiter/tabs/my_jobs_tab.dart';
import 'package:chongyai_mobile/screens/recruiter/tabs/post_job_tab.dart';
import 'package:chongyai_mobile/screens/recruiter/tabs/profile_tab.dart' as recruiter;
import 'package:chongyai_mobile/screens/recruiter/tabs/search_tab.dart' as recruiter;
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _host(Widget child) => MaterialApp(theme: AppTheme.theme, home: Scaffold(body: child));

void main() {
  final tabs = <Widget>[
    const DashboardTab(),
    const JobsTab(),
    const PaymentsTab(),
    const UsersTab(),
    const ReportsTab(),
    const admin.ProfileTab(),
    const HomeTab(),
    const applicant.SearchTab(),
    const ApplicationsTab(),
    const InterviewsTab(),
    const InvitationsTab(),
    const BookmarksTab(),
    const applicant.ProfileTab(),
    const MyJobsTab(),
    const PostJobTab(),
    const ApplicantsTab(),
    const recruiter.InterviewsTab(),
    const recruiter.InvitationsTab(),
    const recruiter.SearchTab(),
    const recruiter.ProfileTab(),
  ];

  testWidgets('All tab widgets can render without crashing', (tester) async {
    for (final tab in tabs) {
      await tester.pumpWidget(_host(tab));
      await tester.pump(const Duration(milliseconds: 200));
      expect(find.byWidget(tab), findsOneWidget);
    }
  });
}
