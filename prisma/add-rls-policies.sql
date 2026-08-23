-- Enable Row Level Security on all user-related tables
-- This ensures users can only access their own data

-- Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Education" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Experience" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PortfolioDesign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactMessage" ENABLE ROW LEVEL SECURITY;

-- User table policies
CREATE POLICY "Users can view their own user record"
  ON "User" FOR SELECT
  USING (id = current_setting('app.user_id', TRUE)::TEXT);

CREATE POLICY "Users can update their own user record"
  ON "User" FOR UPDATE
  USING (id = current_setting('app.user_id', TRUE)::TEXT);

-- Profile table policies
CREATE POLICY "Users can view their own profile"
  ON "Profile" FOR SELECT
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

CREATE POLICY "Users can view public profiles"
  ON "Profile" FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON "Profile" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.user_id', TRUE)::TEXT);

CREATE POLICY "Users can update their own profile"
  ON "Profile" FOR UPDATE
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

CREATE POLICY "Users can delete their own profile"
  ON "Profile" FOR DELETE
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

-- Project table policies
CREATE POLICY "Users can view their own projects"
  ON "Project" FOR SELECT
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

CREATE POLICY "Users can view public projects"
  ON "Project" FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can insert their own projects"
  ON "Project" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.user_id', TRUE)::TEXT);

CREATE POLICY "Users can update their own projects"
  ON "Project" FOR UPDATE
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

CREATE POLICY "Users can delete their own projects"
  ON "Project" FOR DELETE
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

-- Education table policies
CREATE POLICY "Users can manage their own education"
  ON "Education" FOR ALL
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

-- Experience table policies
CREATE POLICY "Users can manage their own experience"
  ON "Experience" FOR ALL
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

-- Skill table policies
CREATE POLICY "Users can manage their own skills"
  ON "Skill" FOR ALL
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

-- SocialLink table policies
CREATE POLICY "Users can manage their own social links"
  ON "SocialLink" FOR ALL
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

-- Portfolio table policies
CREATE POLICY "Users can view their own portfolio"
  ON "Portfolio" FOR SELECT
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

CREATE POLICY "Users can view published portfolios"
  ON "Portfolio" FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Users can manage their own portfolio"
  ON "Portfolio" FOR ALL
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

-- PortfolioDesign table policies
CREATE POLICY "Users can manage their own portfolio design"
  ON "PortfolioDesign" FOR ALL
  USING ("userId" = current_setting('app.user_id', TRUE)::TEXT);

-- ContactMessage table policies
CREATE POLICY "Users can view messages sent to them"
  ON "ContactMessage" FOR SELECT
  USING ("recipientId" = current_setting('app.user_id', TRUE)::TEXT);

CREATE POLICY "Anyone can insert contact messages"
  ON "ContactMessage" FOR INSERT
  WITH CHECK (TRUE);

-- Grant bypass for service role (your server-side code)
-- This allows your Next.js server actions to bypass RLS
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
