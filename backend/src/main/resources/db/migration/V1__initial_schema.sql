--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: order_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_item_seq
    START WITH 20000000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    participants integer NOT NULL,
    price_paid numeric(10,2) NOT NULL,
    created_at timestamp(6) with time zone,
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    scheduled_at timestamp(6) without time zone NOT NULL,
    session_id bigint,
    shop_id bigint NOT NULL,
    tour_id bigint NOT NULL,
    manager_id uuid,
    comment text,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    nationality character varying(255),
    payment_method character varying(255),
    phone character varying(255) NOT NULL,
    preferred_language character varying(255),
    status character varying(255) NOT NULL,
    tour_snapshot text NOT NULL,
    tour_title character varying(255) NOT NULL,
    CONSTRAINT order_items_participants_check CHECK ((participants >= 1)),
    CONSTRAINT order_items_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'EXPIRED'::character varying, 'PLANNED'::character varying, 'PAID'::character varying, 'PARTIALLY_PAID'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'CANCELLED_CONFIRMED'::character varying, 'PARTIALLY_CANCELLED'::character varying, 'REFUNDED'::character varying, 'PARTIALLY_REFUNDED'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying])::text[])))
);


--
-- Name: order_items_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items_aud (
    participants integer,
    price_paid numeric(10,2),
    rev integer NOT NULL,
    revtype smallint,
    created_at timestamp(6) with time zone,
    id bigint NOT NULL,
    order_id bigint,
    scheduled_at timestamp(6) without time zone,
    session_id bigint,
    shop_id bigint,
    tour_id bigint,
    manager_id uuid,
    comment text,
    email character varying(255),
    name character varying(255),
    nationality character varying(255),
    payment_method character varying(255),
    phone character varying(255),
    preferred_language character varying(255),
    status character varying(255),
    tour_snapshot text,
    tour_title character varying(255),
    CONSTRAINT order_items_aud_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'EXPIRED'::character varying, 'PLANNED'::character varying, 'PAID'::character varying, 'PARTIALLY_PAID'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'CANCELLED_CONFIRMED'::character varying, 'PARTIALLY_CANCELLED'::character varying, 'REFUNDED'::character varying, 'PARTIALLY_REFUNDED'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying])::text[])))
);


--
-- Name: order_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_seq
    START WITH 10000000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    total_price numeric(10,2) NOT NULL,
    created_at timestamp(6) with time zone,
    id bigint NOT NULL,
    updated_at timestamp(6) with time zone,
    user_id uuid,
    payment_method character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'EXPIRED'::character varying, 'PLANNED'::character varying, 'PAID'::character varying, 'PARTIALLY_PAID'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'CANCELLED_CONFIRMED'::character varying, 'PARTIALLY_CANCELLED'::character varying, 'REFUNDED'::character varying, 'PARTIALLY_REFUNDED'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying])::text[])))
);


--
-- Name: orders_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders_aud (
    rev integer NOT NULL,
    revtype smallint,
    total_price numeric(10,2),
    created_at timestamp(6) with time zone,
    id bigint NOT NULL,
    updated_at timestamp(6) with time zone,
    user_id uuid,
    payment_method character varying(255),
    status character varying(255),
    CONSTRAINT orders_aud_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'EXPIRED'::character varying, 'PLANNED'::character varying, 'PAID'::character varying, 'PARTIALLY_PAID'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'CANCELLED_CONFIRMED'::character varying, 'PARTIALLY_CANCELLED'::character varying, 'REFUNDED'::character varying, 'PARTIALLY_REFUNDED'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying])::text[])))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    revoked boolean NOT NULL,
    created_at timestamp(6) with time zone,
    expires_at timestamp(6) with time zone NOT NULL,
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(64) NOT NULL
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.refresh_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: revinfo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revinfo (
    rev integer NOT NULL,
    revtstmp bigint
);


--
-- Name: revinfo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.revinfo_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_users (
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    shop_id bigint NOT NULL,
    user_id uuid NOT NULL,
    role character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    CONSTRAINT shop_users_role_check CHECK (((role)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'GUIDE'::character varying, 'MANAGER'::character varying, 'OWNER'::character varying, 'ADMIN'::character varying])::text[]))),
    CONSTRAINT shop_users_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'PENDING'::character varying, 'DISABLED'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- Name: shop_users_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_users_aud (
    rev integer NOT NULL,
    revtype smallint,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    shop_id bigint,
    user_id uuid,
    role character varying(255),
    status character varying(255),
    CONSTRAINT shop_users_aud_role_check CHECK (((role)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'GUIDE'::character varying, 'MANAGER'::character varying, 'OWNER'::character varying, 'ADMIN'::character varying])::text[]))),
    CONSTRAINT shop_users_aud_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'PENDING'::character varying, 'DISABLED'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- Name: shop_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.shop_users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.shop_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: shops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shops (
    id bigint NOT NULL,
    description character varying(255),
    name character varying(255) NOT NULL
);


--
-- Name: shops_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shops_aud (
    rev integer NOT NULL,
    revtype smallint,
    id bigint NOT NULL,
    description character varying(255),
    name character varying(255)
);


--
-- Name: shops_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.shops ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.shops_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tour_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_categories (
    tour_id bigint NOT NULL,
    category character varying(255),
    CONSTRAINT tour_categories_category_check CHECK (((category)::text = ANY ((ARRAY['WALKING'::character varying, 'CYCLING'::character varying, 'HIKING'::character varying, 'BUS'::character varying, 'BOAT'::character varying, 'CAR'::character varying, 'SIGHTSEEING'::character varying, 'CITY_TOUR'::character varying, 'ISLAND'::character varying, 'WORKSHOP'::character varying, 'BOAT_CRUISE'::character varying, 'ADVENTURE'::character varying, 'HISTORY'::character varying, 'CULTURE'::character varying, 'ART'::character varying, 'RELIGION'::character varying, 'NATURE'::character varying, 'WILDLIFE'::character varying, 'FOOD'::character varying, 'WINE'::character varying, 'PHOTOGRAPHY'::character varying, 'MUSIC'::character varying, 'NIGHTLIFE'::character varying, 'FESTIVAL'::character varying, 'SLOW_PACED'::character varying, 'INTENSE'::character varying, 'BUDGET'::character varying])::text[])))
);


--
-- Name: tour_categories_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_categories_aud (
    rev integer NOT NULL,
    revtype smallint,
    tour_id bigint NOT NULL,
    category character varying(255) NOT NULL,
    CONSTRAINT tour_categories_aud_category_check CHECK (((category)::text = ANY ((ARRAY['WALKING'::character varying, 'CYCLING'::character varying, 'HIKING'::character varying, 'BUS'::character varying, 'BOAT'::character varying, 'CAR'::character varying, 'SIGHTSEEING'::character varying, 'CITY_TOUR'::character varying, 'ISLAND'::character varying, 'WORKSHOP'::character varying, 'BOAT_CRUISE'::character varying, 'ADVENTURE'::character varying, 'HISTORY'::character varying, 'CULTURE'::character varying, 'ART'::character varying, 'RELIGION'::character varying, 'NATURE'::character varying, 'WILDLIFE'::character varying, 'FOOD'::character varying, 'WINE'::character varying, 'PHOTOGRAPHY'::character varying, 'MUSIC'::character varying, 'NIGHTLIFE'::character varying, 'FESTIVAL'::character varying, 'SLOW_PACED'::character varying, 'INTENSE'::character varying, 'BUDGET'::character varying])::text[])))
);


--
-- Name: tour_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_images (
    "position" integer,
    id bigint NOT NULL,
    tour_id bigint,
    uploaded_at timestamp(6) without time zone,
    image_url character varying(255)
);


--
-- Name: tour_images_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_images_aud (
    "position" integer,
    rev integer NOT NULL,
    revtype smallint,
    id bigint NOT NULL,
    tour_id bigint,
    uploaded_at timestamp(6) without time zone,
    image_url character varying(255)
);


--
-- Name: tour_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tour_images ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tour_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tour_languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_languages (
    tour_id bigint NOT NULL,
    language character varying(255)
);


--
-- Name: tour_languages_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_languages_aud (
    rev integer NOT NULL,
    revtype smallint,
    tour_id bigint NOT NULL,
    language character varying(255) NOT NULL
);


--
-- Name: tour_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_schedules (
    booked_participants integer NOT NULL,
    date date NOT NULL,
    max_participants integer NOT NULL,
    "time" time(6) without time zone,
    id bigint NOT NULL,
    tour_id bigint NOT NULL,
    status character varying(255) NOT NULL
);


--
-- Name: tour_schedules_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_schedules_aud (
    booked_participants integer,
    date date,
    max_participants integer,
    rev integer NOT NULL,
    revtype smallint,
    "time" time(6) without time zone,
    id bigint NOT NULL,
    tour_id bigint,
    status character varying(255)
);


--
-- Name: tour_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tour_schedules ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tour_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tour_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_session (
    id bigint NOT NULL,
    schedule_id bigint NOT NULL,
    manager_id uuid,
    status character varying(255),
    CONSTRAINT tour_session_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'EXPIRED'::character varying, 'PLANNED'::character varying, 'PAID'::character varying, 'PARTIALLY_PAID'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'CANCELLED_CONFIRMED'::character varying, 'PARTIALLY_CANCELLED'::character varying, 'REFUNDED'::character varying, 'PARTIALLY_REFUNDED'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying])::text[])))
);


--
-- Name: tour_session_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_session_aud (
    rev integer NOT NULL,
    revtype smallint,
    id bigint NOT NULL,
    schedule_id bigint,
    manager_id uuid,
    status character varying(255),
    CONSTRAINT tour_session_aud_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'EXPIRED'::character varying, 'PLANNED'::character varying, 'PAID'::character varying, 'PARTIALLY_PAID'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'CANCELLED_CONFIRMED'::character varying, 'PARTIALLY_CANCELLED'::character varying, 'REFUNDED'::character varying, 'PARTIALLY_REFUNDED'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying])::text[])))
);


--
-- Name: tour_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tour_session ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tour_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tours (
    participants integer NOT NULL,
    price numeric(38,2),
    time_required integer,
    id bigint NOT NULL,
    shop_id bigint NOT NULL,
    description character varying(255),
    intensity character varying(255),
    location character varying(255),
    made_by character varying(255),
    status character varying(255),
    title character varying(255),
    type character varying(255)
);


--
-- Name: tours_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tours_aud (
    participants integer,
    price numeric(38,2),
    rev integer NOT NULL,
    revtype smallint,
    time_required integer,
    id bigint NOT NULL,
    shop_id bigint,
    description character varying(255),
    intensity character varying(255),
    location character varying(255),
    made_by character varying(255),
    status character varying(255),
    title character varying(255),
    type character varying(255)
);


--
-- Name: tours_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tours ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tours_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    created_at timestamp(6) without time zone NOT NULL,
    id uuid NOT NULL,
    bio character varying(255),
    email character varying(255) NOT NULL,
    experience character varying(255),
    languages character varying(255),
    name character varying(255),
    nationality character varying(255),
    password character varying(255) NOT NULL,
    phone character varying(255),
    profile_image_url character varying(255),
    role character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['USER'::character varying, 'MANAGER'::character varying, 'ADMIN'::character varying, 'OWNER'::character varying])::text[])))
);


--
-- Name: users_aud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_aud (
    rev integer NOT NULL,
    revtype smallint,
    created_at timestamp(6) without time zone,
    id uuid NOT NULL,
    bio character varying(255),
    email character varying(255),
    experience character varying(255),
    languages character varying(255),
    name character varying(255),
    nationality character varying(255),
    password character varying(255),
    phone character varying(255),
    profile_image_url character varying(255),
    role character varying(255),
    CONSTRAINT users_aud_role_check CHECK (((role)::text = ANY ((ARRAY['USER'::character varying, 'MANAGER'::character varying, 'ADMIN'::character varying, 'OWNER'::character varying])::text[])))
);


--
-- Name: order_items_aud order_items_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items_aud
    ADD CONSTRAINT order_items_aud_pkey PRIMARY KEY (rev, id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders_aud orders_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders_aud
    ADD CONSTRAINT orders_aud_pkey PRIMARY KEY (rev, id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: revinfo revinfo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revinfo
    ADD CONSTRAINT revinfo_pkey PRIMARY KEY (rev);


--
-- Name: shop_users_aud shop_users_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_users_aud
    ADD CONSTRAINT shop_users_aud_pkey PRIMARY KEY (rev, id);


--
-- Name: shop_users shop_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_users
    ADD CONSTRAINT shop_users_pkey PRIMARY KEY (id);


--
-- Name: shop_users shop_users_shop_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_users
    ADD CONSTRAINT shop_users_shop_id_user_id_key UNIQUE (shop_id, user_id);


--
-- Name: shops_aud shops_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops_aud
    ADD CONSTRAINT shops_aud_pkey PRIMARY KEY (rev, id);


--
-- Name: shops shops_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT shops_name_key UNIQUE (name);


--
-- Name: shops shops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT shops_pkey PRIMARY KEY (id);


--
-- Name: tour_categories_aud tour_categories_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_categories_aud
    ADD CONSTRAINT tour_categories_aud_pkey PRIMARY KEY (rev, tour_id, category);


--
-- Name: tour_images_aud tour_images_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_images_aud
    ADD CONSTRAINT tour_images_aud_pkey PRIMARY KEY (rev, id);


--
-- Name: tour_images tour_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_images
    ADD CONSTRAINT tour_images_pkey PRIMARY KEY (id);


--
-- Name: tour_languages_aud tour_languages_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_languages_aud
    ADD CONSTRAINT tour_languages_aud_pkey PRIMARY KEY (rev, tour_id, language);


--
-- Name: tour_schedules_aud tour_schedules_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_schedules_aud
    ADD CONSTRAINT tour_schedules_aud_pkey PRIMARY KEY (rev, id);


--
-- Name: tour_schedules tour_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_schedules
    ADD CONSTRAINT tour_schedules_pkey PRIMARY KEY (id);


--
-- Name: tour_session_aud tour_session_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_session_aud
    ADD CONSTRAINT tour_session_aud_pkey PRIMARY KEY (rev, id);


--
-- Name: tour_session tour_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_session
    ADD CONSTRAINT tour_session_pkey PRIMARY KEY (id);


--
-- Name: tour_session tour_session_schedule_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_session
    ADD CONSTRAINT tour_session_schedule_id_key UNIQUE (schedule_id);


--
-- Name: tours_aud tours_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours_aud
    ADD CONSTRAINT tours_aud_pkey PRIMARY KEY (rev, id);


--
-- Name: tours tours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_pkey PRIMARY KEY (id);


--
-- Name: users_aud users_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_aud
    ADD CONSTRAINT users_aud_pkey PRIMARY KEY (rev, id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens fk1lih5y2npsf8u5o3vhdb9y0os; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk1lih5y2npsf8u5o3vhdb9y0os FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tour_schedules_aud fk2eo8vb4i3fuhn421neb484bp7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_schedules_aud
    ADD CONSTRAINT fk2eo8vb4i3fuhn421neb484bp7 FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: orders fk32ql8ubntj5uh44ph9659tiih; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk32ql8ubntj5uh44ph9659tiih FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: shop_users_aud fk3ymk9tvxwgey020yqa91ghw0h; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_users_aud
    ADD CONSTRAINT fk3ymk9tvxwgey020yqa91ghw0h FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: order_items fk40xao7afgu6avqsgc0c9qchk7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk40xao7afgu6avqsgc0c9qchk7 FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: tour_categories fk5gl9w8r86ush9etysw1uvvu31; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_categories
    ADD CONSTRAINT fk5gl9w8r86ush9etysw1uvvu31 FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: tour_session_aud fk7gxx04ey8oclnmj0daw3nnmuy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_session_aud
    ADD CONSTRAINT fk7gxx04ey8oclnmj0daw3nnmuy FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: tour_languages fk981nd95ebruohnnc18ckkvy48; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_languages
    ADD CONSTRAINT fk981nd95ebruohnnc18ckkvy48 FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: tour_schedules fka7bvkxeyqhbppi24qimguq9un; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_schedules
    ADD CONSTRAINT fka7bvkxeyqhbppi24qimguq9un FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: tour_session fkb2074ei3wp5cr1iilhtkx9513; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_session
    ADD CONSTRAINT fkb2074ei3wp5cr1iilhtkx9513 FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: order_items fkbioxgbv59vetrxe0ejfubep1w; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkbioxgbv59vetrxe0ejfubep1w FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: users_aud fkc4vk4tui2la36415jpgm9leoq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_aud
    ADD CONSTRAINT fkc4vk4tui2la36415jpgm9leoq FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: shop_users fkd05yfepwl5ivvjioia4d3xnyj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_users
    ADD CONSTRAINT fkd05yfepwl5ivvjioia4d3xnyj FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tour_session fkd6o8vix3jrymbkfhig1efuojo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_session
    ADD CONSTRAINT fkd6o8vix3jrymbkfhig1efuojo FOREIGN KEY (schedule_id) REFERENCES public.tour_schedules(id);


--
-- Name: shops_aud fkfsf5cacprn34b3iao457x01o8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops_aud
    ADD CONSTRAINT fkfsf5cacprn34b3iao457x01o8 FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: tour_categories_aud fki79e5kja5xh7eua6uf0shq6ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_categories_aud
    ADD CONSTRAINT fki79e5kja5xh7eua6uf0shq6ff FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: orders_aud fkinujab7ljkelflu16c9jjch19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders_aud
    ADD CONSTRAINT fkinujab7ljkelflu16c9jjch19 FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: tours fkj97ji3mbk5fcxjwajtpjpue3c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT fkj97ji3mbk5fcxjwajtpjpue3c FOREIGN KEY (shop_id) REFERENCES public.shops(id);


--
-- Name: tour_languages_aud fkk5cqu88j2wksv1mfpnp4b4is9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_languages_aud
    ADD CONSTRAINT fkk5cqu88j2wksv1mfpnp4b4is9 FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: order_items fklcda2w2rd89q7drjl21a6jhjw; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fklcda2w2rd89q7drjl21a6jhjw FOREIGN KEY (session_id) REFERENCES public.tour_session(id);


--
-- Name: tours_aud fkmnhttm904068tc6q87o7exwt4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours_aud
    ADD CONSTRAINT fkmnhttm904068tc6q87o7exwt4 FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: tour_images_aud fkofbuc36m745irqdf767u25yih; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_images_aud
    ADD CONSTRAINT fkofbuc36m745irqdf767u25yih FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: order_items_aud fkp1dp41jyq8k6shc0icihxxvw7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items_aud
    ADD CONSTRAINT fkp1dp41jyq8k6shc0icihxxvw7 FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: shop_users fkqoybcf9p9qoaqgdqtomi5u50p; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_users
    ADD CONSTRAINT fkqoybcf9p9qoaqgdqtomi5u50p FOREIGN KEY (shop_id) REFERENCES public.shops(id);


--
-- Name: order_items fkqvqpk2axhstxtglqbi5lld4ph; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkqvqpk2axhstxtglqbi5lld4ph FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: tour_images fkth1m2rd6q6ltp8kii2msvfi5d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_images
    ADD CONSTRAINT fkth1m2rd6q6ltp8kii2msvfi5d FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- PostgreSQL database dump complete
--

