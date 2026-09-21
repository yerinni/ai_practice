-- Sample content for F7/F8 so onboarding isn't empty on a fresh project.
-- Replace/add rows directly in the Supabase table editor as real content
-- comes in — these tables exist so content doesn't need an app release.

insert into public.testimonials (author_label, body, sort_order) values
  ('첫 나홀로 여행자, 20대', '처음엔 무서웠는데 막상 가보니 별일 없었어요. 오히려 내내 제 페이스대로 다닐 수 있어서 좋았어요.', 0),
  ('첫 나홀로 여행자, 30대', '심심할 때마다 이 앱 켜고 음악 들으면서 걸었어요. 혼자여도 지루할 틈이 없더라고요.', 1),
  ('두 번째 혼자 여행 중', '첫 여행 때 걱정했던 것들이 두 번째는 하나도 안 무서워졌어요. 이번엔 그냥 즐기러 왔어요.', 2);

insert into public.safety_checklist_items (title, description, sort_order) values
  ('숙소·일정 공유해두기', '가족이나 친구에게 숙소 위치와 대략적인 일정을 미리 알려두세요.', 0),
  ('늦은 밤엔 번화가 위주로 이동하기', '인적 드문 골목보다 사람이 많은 큰길 위주로 다니는 게 안전해요.', 1),
  ('현지 긴급 연락처 저장해두기', '현지 경찰·대사관 연락처를 여행 전에 폰에 저장해두세요.', 2);
