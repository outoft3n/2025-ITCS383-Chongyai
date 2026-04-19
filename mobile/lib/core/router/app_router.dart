import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../screens/admin/admin_home_screen.dart';
import '../../screens/applicant/applicant_home_screen.dart';
import '../../screens/auth/login_screen.dart';
import '../../screens/auth/register_screen.dart';
import '../../screens/chat/chat_screen.dart';
import '../../screens/conference/conference_screen.dart';
import '../../screens/splash_screen.dart';
import '../../screens/recruiter/recruiter_home_screen.dart';

class AppRouter {
  static GoRouter router(AuthProvider authProvider) {
    return GoRouter(
      refreshListenable: authProvider,
      initialLocation: '/',
      routes: [
        GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
        GoRoute(path: '/auth/login', builder: (context, state) => const LoginScreen()),
        GoRoute(path: '/auth/register', builder: (context, state) => const RegisterScreen()),
        GoRoute(path: '/applicant', builder: (context, state) => const ApplicantHomeScreen()),
        GoRoute(path: '/recruiter', builder: (context, state) => const RecruiterHomeScreen()),
        GoRoute(path: '/admin', builder: (context, state) => const AdminHomeScreen()),
        GoRoute(path: '/chat', builder: (context, state) => const ChatScreen()),
        GoRoute(path: '/conference', builder: (context, state) => const ConferenceScreen()),
      ],
      redirect: (context, state) {
        final loggedIn = authProvider.isAuthenticated;
        final currentPath = state.uri.path;
        final loggingIn = currentPath == '/auth/login' || currentPath == '/auth/register';
        if (!loggedIn && !loggingIn && currentPath != '/') {
          return '/auth/login';
        }
        if (loggedIn && (currentPath == '/auth/login' || currentPath == '/auth/register' || currentPath == '/')) {
          switch (authProvider.currentUser?.role) {
            case 'APPLICANT':
              return '/applicant';
            case 'RECRUITER':
              return '/recruiter';
            case 'ADMIN':
              return '/admin';
            default:
              return '/auth/login';
          }
        }
        return null;
      },
    );
  }
}
