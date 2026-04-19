import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../widgets/custom_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _companyNameController = TextEditingController();
  String _role = 'APPLICANT';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _companyNameController.dispose();
    super.dispose();
  }

  void _register() async {
    if (!_formKey.currentState!.validate()) return;
    final authProvider = context.read<AuthProvider>();
    await authProvider.register(
      email: _emailController.text.trim(),
      password: _passwordController.text.trim(),
      role: _role,
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      companyName: _role == 'RECRUITER' ? _companyNameController.text.trim() : null,
    );
    if (authProvider.error != null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(authProvider.error!)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              CustomTextField(label: 'Email', controller: _emailController, keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 16),
              CustomTextField(label: 'First name', controller: _firstNameController),
              const SizedBox(height: 16),
              CustomTextField(label: 'Last name', controller: _lastNameController),
              const SizedBox(height: 16),
              CustomTextField(label: 'Password', controller: _passwordController, obscureText: true),
              const SizedBox(height: 16),
              CustomTextField(label: 'Confirm password', controller: _confirmController, obscureText: true),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _role,
                items: const [
                  DropdownMenuItem(value: 'APPLICANT', child: Text('Applicant')),
                  DropdownMenuItem(value: 'RECRUITER', child: Text('Recruiter')),
                ],
                onChanged: (value) {
                  setState(() {
                    _role = value ?? 'APPLICANT';
                  });
                },
                decoration: const InputDecoration(labelText: 'Role'),
              ),
              if (_role == 'RECRUITER') ...[
                const SizedBox(height: 16),
                CustomTextField(label: 'Company name', controller: _companyNameController),
              ],
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: authProvider.isLoading ? null : _register,
                child: authProvider.isLoading ? const CircularProgressIndicator() : const Text('Register'),
              ),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () => context.go('/auth/login'),
                child: const Text('Already have an account? Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
