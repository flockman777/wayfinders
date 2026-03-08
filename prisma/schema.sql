-- Wayfinders Database Schema for PostgreSQL
-- Run this if you prefer manual SQL migration

-- Create database
CREATE DATABASE wayfinders;

-- Connect to database
\c wayfinders;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT ('usr_' || gen_random_uuid()::text),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'MEMBER',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id TEXT PRIMARY KEY DEFAULT ('crs_' || gen_random_uuid()::text),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    thumbnail TEXT,
    price DECIMAL(10,2) NOT NULL,
    "isFree" BOOLEAN DEFAULT false,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT',
    level TEXT DEFAULT 'BEGINNER',
    duration INTEGER DEFAULT 0,
    "instructorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Chapters table
CREATE TABLE chapters (
    id TEXT PRIMARY KEY DEFAULT ('chp_' || gen_random_uuid()::text),
    title TEXT NOT NULL,
    description TEXT,
    "videoUrl" TEXT,
    duration INTEGER DEFAULT 0,
    "isFree" BOOLEAN DEFAULT false,
    "order" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments table
CREATE TABLE enrollments (
    id TEXT PRIMARY KEY DEFAULT ('enr_' || gen_random_uuid()::text),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    UNIQUE("userId", "courseId")
);

-- Progress table
CREATE TABLE progress (
    id TEXT PRIMARY KEY DEFAULT ('prg_' || gen_random_uuid()::text),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "chapterId" TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "isCompleted" BOOLEAN DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "watchedDuration" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "chapterId")
);

-- Communities table
CREATE TABLE communities (
    id TEXT PRIMARY KEY DEFAULT ('com_' || gen_random_uuid()::text),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    thumbnail TEXT,
    banner TEXT,
    "isFree" BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0,
    category TEXT NOT NULL,
    "memberCount" INTEGER DEFAULT 0,
    "ownerId" TEXT NOT NULL REFERENCES users(id),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Community Members table
CREATE TABLE community_members (
    id TEXT PRIMARY KEY DEFAULT ('cmb_' || gen_random_uuid()::text),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "communityId" TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "communityId")
);

-- Posts table
CREATE TABLE posts (
    id TEXT PRIMARY KEY DEFAULT ('pst_' || gen_random_uuid()::text),
    content TEXT NOT NULL,
    "imageUrl" TEXT,
    "authorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "communityId" TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    "likesCount" INTEGER DEFAULT 0,
    "commentsCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Post Likes table
CREATE TABLE post_likes (
    id TEXT PRIMARY KEY DEFAULT ('plk_' || gen_random_uuid()::text),
    "postId" TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("postId", "userId")
);

-- Comments table
CREATE TABLE comments (
    id TEXT PRIMARY KEY DEFAULT ('cmt_' || gen_random_uuid()::text),
    content TEXT NOT NULL,
    "postId" TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    "authorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id TEXT PRIMARY KEY DEFAULT ('trx_' || gen_random_uuid()::text),
    "userId" TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING',
    "xenditInvoiceId" TEXT,
    "xenditPaymentUrl" TEXT,
    "paymentMethod" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Certificates table
CREATE TABLE certificates (
    id TEXT PRIMARY KEY DEFAULT ('cer_' || gen_random_uuid()::text),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "certificateUrl" TEXT,
    "certificateNumber" TEXT UNIQUE DEFAULT ('cert_' || gen_random_uuid()::text),
    "issuedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "courseId")
);

-- Create indexes for better performance
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_chapters_courseId ON chapters("courseId");
CREATE INDEX idx_enrollments_userId ON enrollments("userId");
CREATE INDEX idx_enrollments_courseId ON enrollments("courseId");
CREATE INDEX idx_progress_userId_courseId ON progress("userId", "courseId");
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_posts_communityId ON posts("communityId");
CREATE INDEX idx_transactions_userId ON transactions("userId");
CREATE INDEX idx_transactions_status ON transactions(status);
