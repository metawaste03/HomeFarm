-- Create tips table
create table tips (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users,
    -- Nullable for system tips
    sector text not null check (sector in ('Layer', 'Broiler', 'Fish')),
    type text not null check (type in ('Do', 'Don''t')),
    content text not null,
    votes int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create tip_votes table
create table tip_votes (
    id uuid default gen_random_uuid() primary key,
    tip_id uuid references tips(id) on delete cascade not null,
    user_id uuid references auth.users not null,
    vote_type int not null check (vote_type in (1, -1)),
    unique(tip_id, user_id)
);
-- Seed Data
INSERT INTO tips (sector, type, content, votes)
VALUES (
        'Layer',
        'Do',
        'Collect eggs at least 3 times a day to reduce breakage.',
        15
    ),
    (
        'Layer',
        'Don''t',
        'Neglect calcium supplements in the afternoon feed.',
        10
    ),
    (
        'Broiler',
        'Do',
        'Ensure water lines are flushed daily to prevent biofilm.',
        12
    ),
    (
        'Broiler',
        'Don''t',
        'Overcrowd the birds, especially during heat waves.',
        20
    ),
    (
        'Fish',
        'Do',
        'Monitor ammonia levels daily, especially after heavy feeding.',
        8
    ),
    (
        'Fish',
        'Don''t',
        'Overfeed! Unconsumed feed spoils water quality instantly.',
        18
    );