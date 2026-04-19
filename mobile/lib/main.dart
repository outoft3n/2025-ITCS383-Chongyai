import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: '.env');
  } catch (error) {
    debugPrint('Warning: failed to load .env file: $error');
  }
  runApp(const ChongyaiApp());
}

class ChongyaiApp extends StatefulWidget {
  const ChongyaiApp({super.key});

  @override
  State<ChongyaiApp> createState() => _ChongyaiAppState();
}

class _ChongyaiAppState extends State<ChongyaiApp> {
  late final AuthProvider _auth;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _auth = AuthProvider();
    _router = AppRouter.router(_auth);
    _auth.loadFromStorage();
  }

  @override
  void dispose() {
    _auth.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<AuthProvider>.value(
      value: _auth,
      child: MaterialApp.router(
        title: 'Chongyai Jobs',
        theme: AppTheme.theme,
        routerConfig: _router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
