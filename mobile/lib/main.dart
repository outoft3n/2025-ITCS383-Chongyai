import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
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

class ChongyaiApp extends StatelessWidget {
  const ChongyaiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider()..loadFromStorage(),
        ),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          return MaterialApp.router(
            title: 'Chongyai Jobs',
            theme: AppTheme.theme,
            routerConfig: AppRouter.router(authProvider),
            debugShowCheckedModeBanner: false,
          );
        },
      ),
    );
  }
}
