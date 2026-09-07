SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ultimate_prompts;

INSERT INTO tool_types (id, slug, label) VALUES
  (UUID(), 'chat', 'Chat'),
  (UUID(), 'agentic', 'Agentic'),
  (UUID(), 'gemini', 'Gemini');

INSERT INTO categories (id, slug, label) VALUES
  (UUID(), 'marketing', 'Marketing'),
  (UUID(), 'sales', 'Sales'),
  (UUID(), 'hr', 'HR'),
  (UUID(), 'design', 'Design'),
  (UUID(), 'operations', 'Operations');
