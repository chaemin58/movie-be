-- 아래 문자열은 로그인에 사용할 수 없는 학습용 더미이며 실제 비밀번호가 아닙니다.
-- 재실행해도 기존 회원 정보와 평점을 덮어쓰지 않습니다.
INSERT INTO member (email, password, nickname) VALUES
('noco@umc.com', '$2a$10$dummyEncodedPasswordValue', '수현'),
('minseo@umc.com', '$2a$10$dummyEncodedPasswordValue', '민서')
ON DUPLICATE KEY UPDATE member_id = member_id;

-- ID가 반드시 1, 2라고 가정하지 않고 이메일로 회원을 찾아 연결합니다.
INSERT INTO rating (member_id, movie_id, score, comment)
SELECT member_id, 550, 5, '최고의 영화!' FROM member WHERE email = 'noco@umc.com'
ON DUPLICATE KEY UPDATE rating_id = rating_id;

INSERT INTO rating (member_id, movie_id, score, comment)
SELECT member_id, 155, 4, '다시 봐도 명작' FROM member WHERE email = 'noco@umc.com'
ON DUPLICATE KEY UPDATE rating_id = rating_id;

INSERT INTO rating (member_id, movie_id, score, comment)
SELECT member_id, 550, 3, '호불호가 갈릴 것 같아요' FROM member WHERE email = 'minseo@umc.com'
ON DUPLICATE KEY UPDATE rating_id = rating_id;
