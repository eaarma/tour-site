SELECT setval(
    'public.tours_id_seq',
    COALESCE((SELECT MAX(id) FROM public.tours), 0) + 1,
    false
);
