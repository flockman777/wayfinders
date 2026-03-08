import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password
  const hashedPassword = await bcrypt.hash('wayfinders123', 12);
  const adminHashedPassword = await bcrypt.hash('admin123', 12);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wayfinders.id' },
    update: {},
    create: {
      name: 'Admin Wayfinders',
      email: 'admin@wayfinders.id',
      password: adminHashedPassword,
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=Admin+Wayfinders&background=F5A623&color=fff',
    },
  });
  console.log('✅ Created admin user');

  // Create Instructors
  const instructor1 = await prisma.user.upsert({
    where: { email: 'andi.pratama@wayfinders.id' },
    update: {},
    create: {
      name: 'Andi Pratama',
      email: 'andi.pratama@wayfinders.id',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      avatar: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=0F1B2D&color=fff',
    },
  });
  console.log('✅ Created instructor: Andi Pratama');

  const instructor2 = await prisma.user.upsert({
    where: { email: 'sarah.wijaya@wayfinders.id' },
    update: {},
    create: {
      name: 'Sarah Wijaya',
      email: 'sarah.wijaya@wayfinders.id',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Wijaya&background=F5A623&color=fff',
    },
  });
  console.log('✅ Created instructor: Sarah Wijaya');

  // Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@email.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'user@email.com',
      password: hashedPassword,
      role: 'MEMBER',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3B82F6&color=fff',
    },
  });
  console.log('✅ Created demo user');

  // Create Courses
  const courses = [
    {
      title: 'Bangun Bisnis Online dari Nol',
      slug: 'bangun-bisnis-online-dari-nol',
      description: 'Pelajari cara membangun bisnis online yang profitable dari nol, bahkan tanpa pengalaman sebelumnya. Kursus ini mencakup semua aspek penting mulai dari validasi ide, pembuatan produk, marketing, hingga scaling bisnis.',
      price: 299000,
      isFree: false,
      category: 'BISNIS',
      level: 'BEGINNER',
      instructorId: instructor1.id,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop',
    },
    {
      title: 'Python untuk Pemula',
      slug: 'python-untuk-pemula',
      description: 'Mulai perjalanan coding-mu dengan Python. Kursus lengkap untuk pemula absolut yang ingin belajar programming dari dasar. Covers syntax, data structures, OOP, dan project-based learning.',
      price: 0,
      isFree: true,
      category: 'TECH',
      level: 'BEGINNER',
      instructorId: instructor2.id,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop',
    },
    {
      title: 'UI/UX Design Masterclass',
      slug: 'ui-ux-design-masterclass',
      description: 'Kuasai prinsip UI/UX design dan buat portfolio yang memukau dengan studi kasus real. Belajar Figma, design thinking, user research, dan create design system yang scalable.',
      price: 499000,
      isFree: false,
      category: 'DESAIN',
      level: 'INTERMEDIATE',
      instructorId: instructor1.id,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
    },
    {
      title: 'Mindset & Produktivitas',
      slug: 'mindset-produktivitas',
      description: 'Bangun mindset sukses dan tingkatkan produktivitas harianmu dengan teknik proven. Learn time management, goal setting, habit formation, dan overcome procrastination.',
      price: 0,
      isFree: true,
      category: 'SELF_DEV',
      level: 'BEGINNER',
      instructorId: instructor2.id,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=400&fit=crop',
    },
    {
      title: 'Digital Marketing 2025',
      slug: 'digital-marketing-2025',
      description: 'Strategi digital marketing terbaru untuk menguasai pasar di era digital 2025. Covers SEO, SEM, social media marketing, content marketing, dan analytics.',
      price: 349000,
      isFree: false,
      category: 'BISNIS',
      level: 'INTERMEDIATE',
      instructorId: instructor1.id,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    },
    {
      title: 'React JS Fullstack',
      slug: 'react-js-fullstack',
      description: 'Menjadi fullstack developer dengan React, Node.js, dan modern tools. Build real-world projects dengan Next.js, TypeScript, Prisma, dan deploy to production.',
      price: 599000,
      isFree: false,
      category: 'TECH',
      level: 'ADVANCED',
      instructorId: instructor2.id,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: courseData,
      create: courseData,
    });
    console.log(`✅ Created course: ${course.title}`);

    // Create chapters for each course
    const chaptersData = [
      {
        title: 'Introduction & Fundamentals',
        description: 'Memahami konsep dasar dan fundamental',
        duration: 25,
        isFree: true,
        order: 1,
      },
      {
        title: 'Getting Started',
        description: 'Setup environment dan tools yang diperlukan',
        duration: 30,
        isFree: true,
        order: 2,
      },
      {
        title: 'Core Concepts',
        description: 'Mendalami konsep inti dari materi',
        duration: 45,
        isFree: false,
        order: 3,
      },
      {
        title: 'Advanced Techniques',
        description: 'Teknik lanjutan untuk tingkatkan skill',
        duration: 50,
        isFree: false,
        order: 4,
      },
      {
        title: 'Real-world Project',
        description: 'Implementasi dalam project nyata',
        duration: 60,
        isFree: false,
        order: 5,
      },
    ];

    for (const chapterData of chaptersData) {
      await prisma.chapter.create({
        data: {
          ...chapterData,
          courseId: course.id,
          videoUrl: `https://example.com/video/${course.slug}/${chapterData.order}`,
        },
      });
    }
    console.log(`✅ Created chapters for: ${course.title}`);
  }

  // Create Communities
  const communities = [
    {
      name: 'Founders Circle',
      slug: 'founders-circle',
      description: 'Komunitas eksklusif untuk founder dan entrepreneur yang ingin scale-up bisnis mereka. Networking, sharing session, dan mentorship dari founder sukses.',
      isFree: false,
      price: 99000,
      category: 'Bisnis & Entrepreneurship',
      ownerId: instructor1.id,
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
    },
    {
      name: 'Dev & Code',
      slug: 'dev-and-code',
      description: 'Komunitas developer Indonesia untuk sharing, belajar, dan berkolaborasi dalam proyek open source. Weekly meetups, code review, dan career guidance.',
      isFree: true,
      price: 0,
      category: 'Programming & Tech',
      ownerId: instructor2.id,
      thumbnail: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=600&h=400&fit=crop',
    },
    {
      name: 'Design Tribe',
      slug: 'design-tribe',
      description: 'Wadah bagi desainer kreatif untuk berbagi inspirasi, feedback, dan opportunity. Design critique, portfolio review, dan job opportunities.',
      isFree: true,
      price: 0,
      category: 'Desain & Kreatif',
      ownerId: instructor1.id,
      thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop',
    },
    {
      name: 'Growth Mindset',
      slug: 'growth-mindset',
      description: 'Komunitas pengembangan diri untuk mencapai potensi maksimal dalam karir dan kehidupan. Book club, accountability partners, dan personal coaching.',
      isFree: false,
      price: 49000,
      category: 'Self Development',
      ownerId: instructor2.id,
      thumbnail: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=400&fit=crop',
    },
  ];

  for (const communityData of communities) {
    const community = await prisma.community.upsert({
      where: { slug: communityData.slug },
      update: communityData,
      create: communityData,
    });
    console.log(`✅ Created community: ${community.name}`);

    // Add demo user as member
    await prisma.communityMember.create({
      data: {
        userId: demoUser.id,
        communityId: community.id,
        role: 'MEMBER',
      },
    });

    // Update member count
    await prisma.community.update({
      where: { id: community.id },
      data: {
        memberCount: 1,
      },
    });
  }

  // Create sample enrollments for demo user
  const freeCourses = await prisma.course.findMany({
    where: { isFree: true },
    select: { id: true },
  });

  for (const course of freeCourses) {
    await prisma.enrollment.create({
      data: {
        userId: demoUser.id,
        courseId: course.id,
        status: 'ACTIVE',
      },
    });
  }
  console.log('✅ Created enrollments for demo user');

  // Create sample posts in communities
  const allCommunities = await prisma.community.findMany();
  
  for (const community of allCommunities) {
    await prisma.post.create({
      data: {
        content: `Selamat datang di ${community.name}! Mari berbagi dan belajar bersama.`,
        authorId: demoUser.id,
        communityId: community.id,
      },
    });
  }
  console.log('✅ Created sample posts');

  // Create sample transactions
  const paidCourses = await prisma.course.findMany({
    where: { isFree: false },
    take: 3,
  });

  for (const course of paidCourses) {
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        type: 'COURSE',
        referenceId: course.id,
        amount: Number(course.price),
        status: 'PAID',
        paymentMethod: 'BCA',
        paidAt: new Date(),
      },
    });
  }
  console.log('✅ Created sample transactions');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
