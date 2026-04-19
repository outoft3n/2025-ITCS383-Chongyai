import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../widgets/auth_shell.dart';
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

  static final _emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

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

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    final authProvider = context.read<AuthProvider>();
    final companyTrimmed = _companyNameController.text.trim();
    await authProvider.register(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      role: _role,
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      companyName: _role == 'RECRUITER' && companyTrimmed.isNotEmpty ? companyTrimmed : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return AuthPageShell(
      header: const AuthBrandHeader(
        title: 'Create your account',
        subtitle: 'Join thousands of professionals',
      ),
      child: AuthCard(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _RoleCard(
                  selected: _role == 'APPLICANT',
                  title: 'Job Seeker',
                  subtitle: '500 THB fee',
                  icon: Icons.person_outline_rounded,
                  onTap: () => setState(() => _role = 'APPLICANT'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _RoleCard(
                  selected: _role == 'RECRUITER',
                  title: 'Employer',
                  subtitle: '5,000 THB fee',
                  icon: Icons.business_rounded,
                  onTap: () => setState(() => _role = 'RECRUITER'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          if (authProvider.error != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFECACA)),
              ),
              child: Text(
                authProvider.error!,
                style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 14),
              ),
            ),
            const SizedBox(height: 16),
          ],
          Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: CustomTextField(
                        label: 'First Name',
                        controller: _firstNameController,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) return 'First name is required';
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: CustomTextField(
                        label: 'Last Name',
                        controller: _lastNameController,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) return 'Last name is required';
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  label: 'Email',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    final v = value?.trim() ?? '';
                    if (v.isEmpty) return 'Email is required';
                    if (!_emailRegex.hasMatch(v)) return 'Invalid email address';
                    return null;
                  },
                ),
                if (_role == 'RECRUITER') ...[
                  const SizedBox(height: 12),
                  CustomTextField(
                    label: 'Company Name',
                    controller: _companyNameController,
                    validator: (_) => null,
                  ),
                ],
                const SizedBox(height: 12),
                CustomTextField(
                  label: 'Password',
                  controller: _passwordController,
                  obscureText: true,
                  validator: (value) {
                    final v = value ?? '';
                    if (v.isEmpty) return 'Password is required';
                    if (v.length < 8) return 'Password must be at least 8 characters';
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  label: 'Confirm Password',
                  controller: _confirmController,
                  obscureText: true,
                  validator: (value) {
                    if (value != _passwordController.text) return "Passwords don't match";
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: authProvider.isLoading ? null : _register,
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: authProvider.isLoading
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Create Account'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'You can browse jobs for free. A payment is required when you submit your first application.',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 4,
            children: [
              Text(
                'Already have an account?',
                style: TextStyle(color: Colors.grey[600], fontSize: 14),
              ),
              TextButton(
                onPressed: () => context.go('/auth/login'),
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  'Sign in',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final bool selected;
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _RoleCard({
    required this.selected,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              width: 2,
              color: selected ? primary : const Color(0xFFE5E7EB),
            ),
            color: selected ? const Color(0xFFFFF7ED) : Colors.white,
          ),
          child: Column(
            children: [
              Icon(
                icon,
                size: 26,
                color: selected ? primary : const Color(0xFF9CA3AF),
              ),
              const SizedBox(height: 6),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: selected ? primary : const Color(0xFF374151),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
