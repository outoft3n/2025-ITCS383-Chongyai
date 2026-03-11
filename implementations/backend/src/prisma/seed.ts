import { PrismaClient, Role, JobType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@chongyai.com' },
    update: {},
    create: {
      email: 'admin@chongyai.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      firstName: 'Admin',
      lastName: 'Chongyai',
      isVerified: true,
      isPaid: true,
    },
  });

  // Recruiter 1
  const rec1Password = await bcrypt.hash('Recruiter@123', 12);
  const recruiter1 = await prisma.user.upsert({
    where: { email: 'recruiter1@techcorp.com' },
    update: {},
    create: {
      email: 'recruiter1@techcorp.com',
      passwordHash: rec1Password,
      role: Role.RECRUITER,
      firstName: 'Somchai',
      lastName: 'Wongkham',
      isVerified: true,
      isPaid: true,
      recruiterProfile: {
        create: {
          companyName: 'TechCorp Thailand',
          companyDescription: 'Leading technology company in Bangkok',
          website: 'https://techcorp.th',
          industry: 'Information Technology',
        },
      },
    },
  });

  // Recruiter 2
  const rec2Password = await bcrypt.hash('Recruiter@123', 12);
  const recruiter2 = await prisma.user.upsert({
    where: { email: 'recruiter2@startup.io' },
    update: {},
    create: {
      email: 'recruiter2@startup.io',
      passwordHash: rec2Password,
      role: Role.RECRUITER,
      firstName: 'Nattaporn',
      lastName: 'Saensuk',
      isVerified: true,
      isPaid: true,
      recruiterProfile: {
        create: {
          companyName: 'StartupHub',
          companyDescription: 'Innovative startup incubator',
          website: 'https://startuphub.io',
          industry: 'Finance Technology',
        },
      },
    },
  });

  // Applicant 1
  const app1Password = await bcrypt.hash('Applicant@123', 12);
  await prisma.user.upsert({
    where: { email: 'applicant1@email.com' },
    update: {},
    create: {
      email: 'applicant1@email.com',
      passwordHash: app1Password,
      role: Role.APPLICANT,
      firstName: 'Siriporn',
      lastName: 'Chaiyaporn',
      isVerified: true,
      isPaid: true,
      applicantProfile: {
        create: {
          skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
          experience: '3 years of full-stack development',
          education: "Bachelor's in Computer Science, Chulalongkorn University",
          preferredLocation: 'Bangkok',
          preferredSalaryMin: 50000,
          preferredSalaryMax: 80000,
        },
      },
    },
  });

  // Applicant 2
  const app2Password = await bcrypt.hash('Applicant@123', 12);
  await prisma.user.upsert({
    where: { email: 'applicant2@email.com' },
    update: {},
    create: {
      email: 'applicant2@email.com',
      passwordHash: app2Password,
      role: Role.APPLICANT,
      firstName: 'Kritsada',
      lastName: 'Phongphit',
      isVerified: false,
      isPaid: false,
      applicantProfile: {
        create: {
          skills: ['Python', 'Machine Learning', 'Data Analysis'],
          experience: '2 years of data science',
          education: "Master's in Data Science, Mahidol University",
          preferredLocation: 'Remote',
          preferredSalaryMin: 45000,
          preferredSalaryMax: 70000,
        },
      },
    },
  });

  // Sample Jobs
  const jobs = [
    {
      recruiterId: recruiter1.id,
      title: 'Senior Full-Stack Developer',
      description:
        'We are looking for an experienced full-stack developer to join our growing team. You will work on cutting-edge web applications serving millions of users.',
      requirements:
        '5+ years of experience, proficiency in React and Node.js, strong understanding of databases.',
      location: 'Bangkok',
      jobType: JobType.FULL_TIME,
      salaryMin: 70000,
      salaryMax: 100000,
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    },
    {
      recruiterId: recruiter1.id,
      title: 'DevOps Engineer',
      description:
        'Join our infrastructure team to build and maintain scalable cloud systems. Work with Kubernetes, AWS, and CI/CD pipelines.',
      requirements:
        '3+ years of DevOps experience, AWS/GCP knowledge, Kubernetes proficiency.',
      location: 'Bangkok',
      jobType: JobType.FULL_TIME,
      salaryMin: 60000,
      salaryMax: 90000,
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    },
    {
      recruiterId: recruiter1.id,
      title: 'Frontend Developer (React)',
      description:
        'Build beautiful, responsive user interfaces for our enterprise software products.',
      requirements:
        '2+ years React experience, TypeScript knowledge, attention to UI/UX detail.',
      location: 'Remote',
      jobType: JobType.REMOTE,
      salaryMin: 45000,
      salaryMax: 65000,
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma'],
    },
    {
      recruiterId: recruiter2.id,
      title: 'Data Scientist',
      description:
        'Analyze large datasets to drive business decisions. Build ML models to predict user behavior and optimize our platform.',
      requirements:
        '3+ years in data science, Python expertise, experience with ML frameworks.',
      location: 'Bangkok',
      jobType: JobType.FULL_TIME,
      salaryMin: 60000,
      salaryMax: 85000,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas'],
    },
    {
      recruiterId: recruiter2.id,
      title: 'Mobile Developer (React Native)',
      description:
        'Develop cross-platform mobile applications for our fintech products used by thousands of customers.',
      requirements:
        '2+ years React Native experience, iOS/Android knowledge, API integration skills.',
      location: 'Bangkok',
      jobType: JobType.FULL_TIME,
      salaryMin: 50000,
      salaryMax: 75000,
      skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'REST API'],
    },
    {
      recruiterId: recruiter2.id,
      title: 'Backend Intern',
      description:
        'Learn and grow with our experienced engineering team. Work on real projects with mentorship.',
      requirements:
        'Computer Science student or recent graduate, basic programming knowledge.',
      location: 'Bangkok',
      jobType: JobType.INTERNSHIP,
      salaryMin: 15000,
      salaryMax: 20000,
      skills: ['Node.js', 'JavaScript', 'Git'],
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }
}

process.stdout.write('Seeding database...\n');
main()
  .then(() => {
    console.log("Seeding completed.");
  })
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });