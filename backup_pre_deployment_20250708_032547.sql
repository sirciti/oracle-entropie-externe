--
-- PostgreSQL database dump
--

-- Dumped from database version 13.21 (Debian 13.21-1.pgdg120+1)
-- Dumped by pg_dump version 13.21 (Debian 13.21-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: visites; Type: TABLE; Schema: public; Owner: oracle_user
--

CREATE TABLE public.visites (
    id integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    page character varying(255) NOT NULL,
    ip_address character varying(45) NOT NULL,
    time_spent integer DEFAULT 0,
    view_id character varying(100)
);


ALTER TABLE public.visites OWNER TO oracle_user;

--
-- Name: visites_id_seq; Type: SEQUENCE; Schema: public; Owner: oracle_user
--

CREATE SEQUENCE public.visites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.visites_id_seq OWNER TO oracle_user;

--
-- Name: visites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: oracle_user
--

ALTER SEQUENCE public.visites_id_seq OWNED BY public.visites.id;


--
-- Name: visites id; Type: DEFAULT; Schema: public; Owner: oracle_user
--

ALTER TABLE ONLY public.visites ALTER COLUMN id SET DEFAULT nextval('public.visites_id_seq'::regclass);


--
-- Data for Name: visites; Type: TABLE DATA; Schema: public; Owner: oracle_user
--

COPY public.visites (id, date, page, ip_address, time_spent, view_id) FROM stdin;
1	2025-07-08 00:12:48.369419	/metrics	172.19.0.4	0	default
2	2025-07-08 00:13:03.371507	/metrics	172.19.0.4	0	default
3	2025-07-08 00:13:03.690765	/api/geometry/icosahedron/initial	127.0.0.1	0	default
4	2025-07-08 00:13:18.370553	/metrics	172.19.0.4	0	default
5	2025-07-08 00:13:33.372936	/metrics	172.19.0.4	0	default
6	2025-07-08 00:13:33.75278	/api/geometry/icosahedron/initial	127.0.0.1	0	default
7	2025-07-08 00:13:48.369535	/metrics	172.19.0.4	0	default
8	2025-07-08 00:14:03.368951	/metrics	172.19.0.4	0	default
9	2025-07-08 00:14:03.812911	/api/geometry/icosahedron/initial	127.0.0.1	0	default
10	2025-07-08 00:14:18.371041	/metrics	172.19.0.4	0	default
11	2025-07-08 00:14:33.370319	/metrics	172.19.0.4	0	default
12	2025-07-08 00:14:33.865235	/api/geometry/icosahedron/initial	127.0.0.1	0	default
13	2025-07-08 00:14:48.369241	/metrics	172.19.0.4	0	default
14	2025-07-08 00:15:03.369322	/metrics	172.19.0.4	0	default
15	2025-07-08 00:15:03.916826	/api/geometry/icosahedron/initial	127.0.0.1	0	default
16	2025-07-08 00:15:18.370694	/metrics	172.19.0.4	0	default
17	2025-07-08 00:15:33.37029	/metrics	172.19.0.4	0	default
18	2025-07-08 00:15:33.96921	/api/geometry/icosahedron/initial	127.0.0.1	0	default
19	2025-07-08 00:15:48.369638	/metrics	172.19.0.4	0	default
20	2025-07-08 00:16:03.370476	/metrics	172.19.0.4	0	default
21	2025-07-08 00:16:04.020902	/api/geometry/icosahedron/initial	127.0.0.1	0	default
22	2025-07-08 00:16:18.369872	/metrics	172.19.0.4	0	default
23	2025-07-08 00:16:19.781904	/api/generate_token	172.19.0.3	0	default
24	2025-07-08 00:16:21.370421	/api/geometry/icosahedron/initial	172.19.0.3	0	default
25	2025-07-08 00:16:21.370437	/api/geometry/icosahedron/animate	172.19.0.3	0	default
26	2025-07-08 00:16:23.899065	/api/geometry/spiral_simple/animate	172.19.0.3	0	default
27	2025-07-08 00:16:25.870036	/api/geometry/centrifuge_laser/animate	172.19.0.3	0	default
28	2025-07-08 00:16:26.549777	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
29	2025-07-08 00:16:26.587678	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
30	2025-07-08 00:16:26.649821	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
31	2025-07-08 00:16:26.756139	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
32	2025-07-08 00:16:26.856377	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
33	2025-07-08 00:16:26.958123	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
34	2025-07-08 00:16:27.074491	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
35	2025-07-08 00:16:27.141636	/api/geometry/torus_spring/animate	172.19.0.3	0	default
36	2025-07-08 00:16:27.728642	/api/geometry/crypto_token_river/animate	172.19.0.3	0	default
37	2025-07-08 00:16:30.449998	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
38	2025-07-08 00:16:30.668939	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
39	2025-07-08 00:16:32.454745	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
40	2025-07-08 00:16:33.134104	/api/geometry/spiral_simple/animate	172.19.0.3	0	default
41	2025-07-08 00:16:33.36869	/metrics	172.19.0.4	0	default
42	2025-07-08 00:16:34.073179	/api/geometry/icosahedron/initial	127.0.0.1	0	default
43	2025-07-08 00:16:34.450716	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
44	2025-07-08 00:16:38.477673	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
45	2025-07-08 00:16:42.449377	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
46	2025-07-08 00:16:44.449071	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
47	2025-07-08 00:16:48.36877	/metrics	172.19.0.4	0	default
48	2025-07-08 00:16:48.450104	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
49	2025-07-08 00:16:52.463224	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
50	2025-07-08 00:16:56.470217	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
51	2025-07-08 00:17:00.449567	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
52	2025-07-08 00:17:03.368226	/metrics	172.19.0.4	0	default
53	2025-07-08 00:17:04.12391	/api/geometry/icosahedron/initial	127.0.0.1	0	default
54	2025-07-08 00:17:04.449586	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
55	2025-07-08 00:17:08.447472	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
56	2025-07-08 00:17:12.463355	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
57	2025-07-08 00:17:16.461886	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
58	2025-07-08 00:17:18.368945	/metrics	172.19.0.4	0	default
59	2025-07-08 00:17:20.455954	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
60	2025-07-08 00:17:24.448216	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
61	2025-07-08 00:17:26.474973	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
62	2025-07-08 00:17:30.448138	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
63	2025-07-08 00:17:32.579786	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
64	2025-07-08 00:17:33.36973	/metrics	172.19.0.4	0	default
65	2025-07-08 00:17:34.181626	/api/geometry/icosahedron/initial	127.0.0.1	0	default
66	2025-07-08 00:17:36.505629	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
67	2025-07-08 00:17:38.463288	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
68	2025-07-08 00:17:42.447034	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
69	2025-07-08 00:17:46.446702	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
70	2025-07-08 00:17:48.368701	/metrics	172.19.0.4	0	default
71	2025-07-08 00:17:48.449526	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
72	2025-07-08 00:17:52.463594	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
73	2025-07-08 00:17:56.446981	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
74	2025-07-08 00:17:58.451469	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
75	2025-07-08 00:18:02.447383	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
76	2025-07-08 00:18:03.368995	/metrics	172.19.0.4	0	default
77	2025-07-08 00:18:04.232298	/api/geometry/icosahedron/initial	127.0.0.1	0	default
78	2025-07-08 00:18:04.44759	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
79	2025-07-08 00:18:08.453467	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
80	2025-07-08 00:18:10.448315	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
81	2025-07-08 00:18:12.452547	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
82	2025-07-08 00:18:14.459315	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
83	2025-07-08 00:18:18.369441	/metrics	172.19.0.4	0	default
84	2025-07-08 00:18:18.44641	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
85	2025-07-08 00:18:20.450372	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
86	2025-07-08 00:18:24.446096	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
87	2025-07-08 00:18:28.447991	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
88	2025-07-08 00:18:30.449065	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
89	2025-07-08 00:18:33.369453	/metrics	172.19.0.4	0	default
90	2025-07-08 00:18:34.299576	/api/geometry/icosahedron/initial	127.0.0.1	0	default
91	2025-07-08 00:18:34.450992	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
92	2025-07-08 00:18:36.460996	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
93	2025-07-08 00:18:40.459582	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
94	2025-07-08 00:18:44.446739	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
95	2025-07-08 00:18:48.368854	/metrics	172.19.0.4	0	default
96	2025-07-08 00:18:48.446405	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
97	2025-07-08 00:18:50.466318	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
98	2025-07-08 00:18:52.470128	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
99	2025-07-08 00:18:56.449099	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
100	2025-07-08 00:18:58.459603	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
101	2025-07-08 00:19:00.461508	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
102	2025-07-08 00:19:03.369086	/metrics	172.19.0.4	0	default
103	2025-07-08 00:19:04.368744	/api/geometry/icosahedron/initial	127.0.0.1	0	default
104	2025-07-08 00:19:04.444741	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
105	2025-07-08 00:19:08.446759	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
106	2025-07-08 00:19:12.458533	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
107	2025-07-08 00:19:16.446263	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
108	2025-07-08 00:19:18.368885	/metrics	172.19.0.4	0	default
109	2025-07-08 00:19:18.447475	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
110	2025-07-08 00:19:20.45891	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
111	2025-07-08 00:19:24.444784	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
112	2025-07-08 00:19:26.444941	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
113	2025-07-08 00:19:30.444807	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
114	2025-07-08 00:19:32.457805	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
115	2025-07-08 00:19:33.369856	/metrics	172.19.0.4	0	default
116	2025-07-08 00:19:34.445985	/api/geometry/icosahedron/initial	127.0.0.1	0	default
117	2025-07-08 00:19:36.45901	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
118	2025-07-08 00:19:38.458699	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
119	2025-07-08 00:19:42.444201	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
120	2025-07-08 00:19:46.444	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
121	2025-07-08 00:19:48.368125	/metrics	172.19.0.4	0	default
122	2025-07-08 00:19:50.443123	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
123	2025-07-08 00:19:52.447499	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
124	2025-07-08 00:19:54.461142	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
125	2025-07-08 00:19:58.456584	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
126	2025-07-08 00:20:00.455347	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
127	2025-07-08 00:20:03.368759	/metrics	172.19.0.4	0	default
128	2025-07-08 00:20:04.444448	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
129	2025-07-08 00:20:04.5183	/api/geometry/icosahedron/initial	127.0.0.1	0	default
130	2025-07-08 00:20:08.444464	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
131	2025-07-08 00:20:12.448184	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
132	2025-07-08 00:20:14.455902	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
133	2025-07-08 00:20:16.458935	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
134	2025-07-08 00:20:18.36994	/metrics	172.19.0.4	0	default
135	2025-07-08 00:20:20.454169	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
136	2025-07-08 00:20:24.443901	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
137	2025-07-08 00:20:28.44427	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
138	2025-07-08 00:20:32.444014	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
139	2025-07-08 00:20:33.368451	/metrics	172.19.0.4	0	default
140	2025-07-08 00:20:34.450865	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
141	2025-07-08 00:20:34.589745	/api/geometry/icosahedron/initial	127.0.0.1	0	default
142	2025-07-08 00:20:36.460071	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
143	2025-07-08 00:20:38.464106	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
144	2025-07-08 00:20:40.471536	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
145	2025-07-08 00:20:42.466388	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
146	2025-07-08 00:20:46.463153	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
147	2025-07-08 00:20:48.368798	/metrics	172.19.0.4	0	default
148	2025-07-08 00:20:50.44282	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
149	2025-07-08 00:20:52.465363	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
150	2025-07-08 00:20:56.461502	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
151	2025-07-08 00:21:00.443027	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
152	2025-07-08 00:21:03.368305	/metrics	172.19.0.4	0	default
153	2025-07-08 00:21:04.441608	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
154	2025-07-08 00:21:04.662188	/api/geometry/icosahedron/initial	127.0.0.1	0	default
155	2025-07-08 00:21:06.449069	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
156	2025-07-08 00:21:10.442463	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
157	2025-07-08 00:21:12.454385	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
158	2025-07-08 00:21:16.45533	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
159	2025-07-08 00:21:18.370568	/metrics	172.19.0.4	0	default
160	2025-07-08 00:21:20.45581	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
161	2025-07-08 00:21:24.442992	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
162	2025-07-08 00:21:28.444609	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
163	2025-07-08 00:21:30.446919	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
164	2025-07-08 00:21:32.464988	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
165	2025-07-08 00:21:33.369145	/metrics	172.19.0.4	0	default
166	2025-07-08 00:21:34.751619	/api/geometry/icosahedron/initial	127.0.0.1	0	default
167	2025-07-08 00:21:36.449969	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
168	2025-07-08 00:21:40.463596	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
169	2025-07-08 00:21:44.444496	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
170	2025-07-08 00:21:46.458707	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
171	2025-07-08 00:21:48.369571	/metrics	172.19.0.4	0	default
172	2025-07-08 00:21:48.459932	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
173	2025-07-08 00:21:52.44658	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
174	2025-07-08 00:21:54.46867	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
175	2025-07-08 00:21:58.442085	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
176	2025-07-08 00:22:00.448561	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
177	2025-07-08 00:22:03.369639	/metrics	172.19.0.4	0	default
178	2025-07-08 00:22:04.446238	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
179	2025-07-08 00:22:04.825694	/api/geometry/icosahedron/initial	127.0.0.1	0	default
180	2025-07-08 00:22:08.451145	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
181	2025-07-08 00:22:10.459193	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
182	2025-07-08 00:22:12.465379	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
183	2025-07-08 00:22:16.514045	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
184	2025-07-08 00:22:18.369767	/metrics	172.19.0.4	0	default
185	2025-07-08 00:22:20.472192	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
186	2025-07-08 00:22:24.442247	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
187	2025-07-08 00:22:26.458907	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
188	2025-07-08 00:22:30.471382	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
189	2025-07-08 00:22:33.370663	/metrics	172.19.0.4	0	default
190	2025-07-08 00:22:34.466462	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
191	2025-07-08 00:22:34.905161	/api/geometry/icosahedron/initial	127.0.0.1	0	default
192	2025-07-08 00:22:38.538982	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
193	2025-07-08 00:22:42.461962	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
194	2025-07-08 00:22:46.46198	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
195	2025-07-08 00:22:48.368331	/metrics	172.19.0.4	0	default
196	2025-07-08 00:22:50.443759	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
197	2025-07-08 00:22:52.446279	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
198	2025-07-08 00:22:56.460773	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
199	2025-07-08 00:22:58.453345	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
200	2025-07-08 00:23:02.43824	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
201	2025-07-08 00:23:03.367345	/metrics	172.19.0.4	0	default
202	2025-07-08 00:23:04.976819	/api/geometry/icosahedron/initial	127.0.0.1	0	default
203	2025-07-08 00:23:06.439395	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
204	2025-07-08 00:23:10.437718	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
205	2025-07-08 00:23:12.454401	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
206	2025-07-08 00:23:16.438731	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
207	2025-07-08 00:23:18.369597	/metrics	172.19.0.4	0	default
208	2025-07-08 00:23:18.440124	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
209	2025-07-08 00:23:20.452313	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
210	2025-07-08 00:23:24.439383	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
211	2025-07-08 00:23:28.438594	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
212	2025-07-08 00:23:30.439537	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
213	2025-07-08 00:23:32.441897	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
214	2025-07-08 00:23:33.368806	/metrics	172.19.0.4	0	default
215	2025-07-08 00:23:35.03596	/api/geometry/icosahedron/initial	127.0.0.1	0	default
216	2025-07-08 00:23:36.442629	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
217	2025-07-08 00:23:40.443713	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
218	2025-07-08 00:23:44.439214	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
219	2025-07-08 00:23:48.367806	/metrics	172.19.0.4	0	default
220	2025-07-08 00:23:48.438909	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
221	2025-07-08 00:23:52.438664	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
222	2025-07-08 00:23:56.482753	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
223	2025-07-08 00:24:00.437822	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
224	2025-07-08 00:24:02.441411	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
225	2025-07-08 00:24:03.3698	/metrics	172.19.0.4	0	default
226	2025-07-08 00:24:05.10792	/api/geometry/icosahedron/initial	127.0.0.1	0	default
227	2025-07-08 00:24:06.442659	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
228	2025-07-08 00:24:10.438595	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
533	2025-07-08 00:38:16.329759	/metrics	172.19.0.2	0	default
229	2025-07-08 00:24:12.443545	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
230	2025-07-08 00:24:14.453332	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
231	2025-07-08 00:24:18.3679	/metrics	172.19.0.4	0	default
232	2025-07-08 00:24:18.442338	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
233	2025-07-08 00:24:20.453621	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
234	2025-07-08 00:24:24.437357	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
235	2025-07-08 00:24:28.436692	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
236	2025-07-08 00:24:32.451082	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
237	2025-07-08 00:24:33.370901	/metrics	172.19.0.4	0	default
238	2025-07-08 00:24:34.454094	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
239	2025-07-08 00:24:35.181689	/api/geometry/icosahedron/initial	127.0.0.1	0	default
240	2025-07-08 00:24:38.439595	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
241	2025-07-08 00:24:40.451104	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
242	2025-07-08 00:24:44.43815	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
243	2025-07-08 00:24:48.369085	/metrics	172.19.0.4	0	default
244	2025-07-08 00:24:48.435642	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
245	2025-07-08 00:24:52.438243	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
246	2025-07-08 00:24:56.437456	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
247	2025-07-08 00:25:00.455592	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
248	2025-07-08 00:25:03.36687	/metrics	172.19.0.4	0	default
249	2025-07-08 00:25:04.441044	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
250	2025-07-08 00:25:05.252441	/api/geometry/icosahedron/initial	127.0.0.1	0	default
251	2025-07-08 00:25:08.439674	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
252	2025-07-08 00:25:10.439905	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
253	2025-07-08 00:25:14.461103	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
254	2025-07-08 00:25:18.369993	/metrics	172.19.0.4	0	default
255	2025-07-08 00:25:18.4633	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
256	2025-07-08 00:25:22.434254	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
257	2025-07-08 00:25:24.437421	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
258	2025-07-08 00:25:28.437224	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
259	2025-07-08 00:25:32.446708	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
260	2025-07-08 00:25:33.370055	/metrics	172.19.0.4	0	default
261	2025-07-08 00:25:35.319755	/api/geometry/icosahedron/initial	127.0.0.1	0	default
262	2025-07-08 00:25:36.436234	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
263	2025-07-08 00:25:40.440183	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
264	2025-07-08 00:25:44.436391	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
265	2025-07-08 00:25:48.365966	/metrics	172.19.0.4	0	default
266	2025-07-08 00:25:48.43978	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
267	2025-07-08 00:25:52.44748	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
268	2025-07-08 00:25:56.449947	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
269	2025-07-08 00:25:58.451829	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
270	2025-07-08 00:26:02.435543	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
271	2025-07-08 00:26:03.368971	/metrics	172.19.0.4	0	default
272	2025-07-08 00:26:05.390024	/api/geometry/icosahedron/initial	127.0.0.1	0	default
273	2025-07-08 00:26:06.43581	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
274	2025-07-08 00:26:10.434099	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
275	2025-07-08 00:26:12.442293	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
276	2025-07-08 00:26:14.448149	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
277	2025-07-08 00:26:18.370436	/metrics	172.19.0.4	0	default
278	2025-07-08 00:26:18.449198	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
279	2025-07-08 00:26:22.434879	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
280	2025-07-08 00:26:26.434479	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
281	2025-07-08 00:26:30.434558	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
282	2025-07-08 00:26:32.449249	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
283	2025-07-08 00:26:33.37009	/metrics	172.19.0.4	0	default
284	2025-07-08 00:26:35.459882	/api/geometry/icosahedron/initial	127.0.0.1	0	default
285	2025-07-08 00:26:36.445315	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
286	2025-07-08 00:26:38.450828	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
287	2025-07-08 00:26:42.434447	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
288	2025-07-08 00:26:46.436558	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
289	2025-07-08 00:26:48.368932	/metrics	172.19.0.4	0	default
290	2025-07-08 00:26:50.434884	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
291	2025-07-08 00:26:52.450539	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
292	2025-07-08 00:26:56.448336	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
293	2025-07-08 00:27:00.441584	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
294	2025-07-08 00:27:03.368787	/metrics	172.19.0.4	0	default
295	2025-07-08 00:27:04.43409	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
296	2025-07-08 00:27:05.541807	/api/geometry/icosahedron/initial	127.0.0.1	0	default
297	2025-07-08 00:27:06.442751	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
298	2025-07-08 00:27:10.451675	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
299	2025-07-08 00:27:14.451049	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
300	2025-07-08 00:27:18.370152	/metrics	172.19.0.4	0	default
301	2025-07-08 00:27:18.452294	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
302	2025-07-08 00:27:22.435781	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
303	2025-07-08 00:27:26.434258	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
304	2025-07-08 00:27:30.437736	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
305	2025-07-08 00:27:32.435414	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
306	2025-07-08 00:27:33.369181	/metrics	172.19.0.4	0	default
307	2025-07-08 00:27:34.476959	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
308	2025-07-08 00:27:35.629697	/api/geometry/icosahedron/initial	127.0.0.1	0	default
309	2025-07-08 00:27:38.47983	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
310	2025-07-08 00:27:40.47003	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
311	2025-07-08 00:27:44.562776	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
312	2025-07-08 00:27:46.584878	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
313	2025-07-08 00:27:48.367145	/metrics	172.19.0.4	0	default
314	2025-07-08 00:27:50.434096	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
315	2025-07-08 00:27:54.436366	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
316	2025-07-08 00:27:56.449314	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
317	2025-07-08 00:28:00.441127	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
318	2025-07-08 00:28:03.368955	/metrics	172.19.0.4	0	default
319	2025-07-08 00:28:04.433376	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
320	2025-07-08 00:28:05.707246	/api/geometry/icosahedron/initial	127.0.0.1	0	default
321	2025-07-08 00:28:08.433647	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
322	2025-07-08 00:28:12.436505	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
323	2025-07-08 00:28:16.448383	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
324	2025-07-08 00:28:18.369616	/metrics	172.19.0.4	0	default
325	2025-07-08 00:28:20.43826	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
326	2025-07-08 00:28:24.434268	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
327	2025-07-08 00:28:26.433847	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
328	2025-07-08 00:28:30.433437	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
329	2025-07-08 00:28:33.370581	/metrics	172.19.0.4	0	default
330	2025-07-08 00:28:34.433483	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
331	2025-07-08 00:28:35.777138	/api/geometry/icosahedron/initial	127.0.0.1	0	default
332	2025-07-08 00:28:36.448583	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
333	2025-07-08 00:28:40.447102	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
334	2025-07-08 00:28:44.431978	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
335	2025-07-08 00:28:46.433301	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
336	2025-07-08 00:28:48.367445	/metrics	172.19.0.4	0	default
337	2025-07-08 00:28:50.432627	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
338	2025-07-08 00:28:52.453745	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
339	2025-07-08 00:28:56.459366	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
340	2025-07-08 00:29:00.45707	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
341	2025-07-08 00:29:03.367418	/metrics	172.19.0.4	0	default
342	2025-07-08 00:29:04.433136	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
343	2025-07-08 00:29:05.847131	/api/geometry/icosahedron/initial	127.0.0.1	0	default
344	2025-07-08 00:29:06.4312	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
345	2025-07-08 00:29:10.432778	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
346	2025-07-08 00:29:12.437348	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
347	2025-07-08 00:29:16.439064	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
348	2025-07-08 00:29:18.370052	/metrics	172.19.0.4	0	default
349	2025-07-08 00:29:18.462579	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
350	2025-07-08 00:29:22.459763	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
351	2025-07-08 00:29:26.435504	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
352	2025-07-08 00:29:30.433553	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
353	2025-07-08 00:29:32.438633	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
354	2025-07-08 00:29:33.370536	/metrics	172.19.0.4	0	default
355	2025-07-08 00:29:35.922396	/api/geometry/icosahedron/initial	127.0.0.1	0	default
356	2025-07-08 00:29:36.441346	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
357	2025-07-08 00:29:40.449087	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
358	2025-07-08 00:29:44.432193	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
359	2025-07-08 00:29:48.367277	/metrics	172.19.0.4	0	default
360	2025-07-08 00:29:48.431222	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
361	2025-07-08 00:29:52.431976	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
362	2025-07-08 00:29:54.436892	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
363	2025-07-08 00:29:58.443324	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
364	2025-07-08 00:30:02.430713	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
365	2025-07-08 00:30:03.369277	/metrics	172.19.0.4	0	default
366	2025-07-08 00:30:05.993774	/api/geometry/icosahedron/initial	127.0.0.1	0	default
367	2025-07-08 00:30:06.431228	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
368	2025-07-08 00:30:10.430308	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
369	2025-07-08 00:30:14.442142	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
370	2025-07-08 00:30:18.368261	/metrics	172.19.0.4	0	default
371	2025-07-08 00:30:18.443059	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
372	2025-07-08 00:30:20.445621	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
373	2025-07-08 00:30:24.448037	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
374	2025-07-08 00:30:28.432137	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
375	2025-07-08 00:30:30.434735	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
376	2025-07-08 00:30:33.368865	/metrics	172.19.0.4	0	default
377	2025-07-08 00:30:34.436362	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
378	2025-07-08 00:30:36.067943	/api/geometry/icosahedron/initial	127.0.0.1	0	default
379	2025-07-08 00:30:36.452509	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
380	2025-07-08 00:30:40.430507	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
381	2025-07-08 00:30:42.437921	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
382	2025-07-08 00:30:46.429485	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
383	2025-07-08 00:30:48.37051	/metrics	172.19.0.4	0	default
384	2025-07-08 00:30:48.432379	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
385	2025-07-08 00:30:52.460194	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
386	2025-07-08 00:30:54.473304	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
387	2025-07-08 00:30:58.441204	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
388	2025-07-08 00:31:00.444505	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
389	2025-07-08 00:31:03.369439	/metrics	172.19.0.4	0	default
390	2025-07-08 00:31:04.429795	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
391	2025-07-08 00:31:06.141594	/api/geometry/icosahedron/initial	127.0.0.1	0	default
392	2025-07-08 00:31:08.450136	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
393	2025-07-08 00:31:10.4931	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
394	2025-07-08 00:31:14.429999	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
395	2025-07-08 00:31:16.442572	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
396	2025-07-08 00:31:18.369663	/metrics	172.19.0.4	0	default
397	2025-07-08 00:31:20.430485	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
398	2025-07-08 00:31:22.437994	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
399	2025-07-08 00:31:26.429678	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
400	2025-07-08 00:31:28.432645	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
401	2025-07-08 00:31:32.444731	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
402	2025-07-08 00:31:33.36816	/metrics	172.19.0.4	0	default
403	2025-07-08 00:31:36.206934	/api/geometry/icosahedron/initial	127.0.0.1	0	default
404	2025-07-08 00:31:36.454846	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
405	2025-07-08 00:31:40.429762	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
406	2025-07-08 00:31:42.431017	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
407	2025-07-08 00:31:46.430235	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
408	2025-07-08 00:31:48.368249	/metrics	172.19.0.4	0	default
409	2025-07-08 00:31:48.442915	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
410	2025-07-08 00:31:52.436154	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
411	2025-07-08 00:31:54.442617	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
412	2025-07-08 00:31:58.440403	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
413	2025-07-08 00:32:02.431205	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
414	2025-07-08 00:32:03.367838	/metrics	172.19.0.4	0	default
415	2025-07-08 00:32:06.272351	/api/geometry/icosahedron/initial	127.0.0.1	0	default
416	2025-07-08 00:32:06.443427	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
417	2025-07-08 00:32:10.434344	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
418	2025-07-08 00:32:12.450065	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
419	2025-07-08 00:32:16.444529	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
420	2025-07-08 00:32:18.368413	/metrics	172.19.0.4	0	default
421	2025-07-08 00:32:20.455496	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
422	2025-07-08 00:32:24.42963	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
423	2025-07-08 00:32:26.430411	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
424	2025-07-08 00:32:28.447357	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
425	2025-07-08 00:32:32.452755	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
426	2025-07-08 00:32:33.368628	/metrics	172.19.0.4	0	default
427	2025-07-08 00:32:34.467416	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
428	2025-07-08 00:32:36.336456	/api/geometry/icosahedron/initial	127.0.0.1	0	default
429	2025-07-08 00:32:38.43022	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
430	2025-07-08 00:32:42.457082	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
431	2025-07-08 00:32:46.429913	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
432	2025-07-08 00:32:48.367063	/metrics	172.19.0.4	0	default
433	2025-07-08 00:32:48.473482	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
434	2025-07-08 00:32:52.444611	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
435	2025-07-08 00:32:56.434982	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
436	2025-07-08 00:33:00.445263	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
437	2025-07-08 00:33:03.3666	/metrics	172.19.0.4	0	default
438	2025-07-08 00:33:04.435027	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
439	2025-07-08 00:33:06.405161	/api/geometry/icosahedron/initial	127.0.0.1	0	default
440	2025-07-08 00:33:08.425359	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
441	2025-07-08 00:33:10.444953	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
442	2025-07-08 00:33:14.452722	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
443	2025-07-08 00:33:18.365948	/metrics	172.19.0.4	0	default
444	2025-07-08 00:33:18.445572	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
445	2025-07-08 00:33:22.431129	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
446	2025-07-08 00:33:26.430468	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
447	2025-07-08 00:33:28.461954	/api/geometry/metacube_oracle/animate	172.19.0.3	0	default
448	2025-07-08 00:34:16.346059	/metrics	172.19.0.2	0	default
449	2025-07-08 00:34:31.330512	/metrics	172.19.0.2	0	default
450	2025-07-08 00:34:37.917058	/api/geometry/icosahedron/initial	127.0.0.1	0	default
451	2025-07-08 00:34:42.554181	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
452	2025-07-08 00:34:44.427164	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
453	2025-07-08 00:34:46.330435	/metrics	172.19.0.2	0	default
454	2025-07-08 00:34:48.492406	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
455	2025-07-08 00:34:52.48497	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
456	2025-07-08 00:34:54.533869	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
457	2025-07-08 00:34:58.526572	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
458	2025-07-08 00:35:00.472857	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
459	2025-07-08 00:35:01.330909	/metrics	172.19.0.2	0	default
460	2025-07-08 00:35:04.466538	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
461	2025-07-08 00:35:07.986724	/api/geometry/icosahedron/initial	127.0.0.1	0	default
462	2025-07-08 00:35:08.552418	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
463	2025-07-08 00:35:12.556594	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
464	2025-07-08 00:35:14.502012	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
465	2025-07-08 00:35:16.330862	/metrics	172.19.0.2	0	default
466	2025-07-08 00:35:18.495524	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
467	2025-07-08 00:35:20.54357	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
468	2025-07-08 00:35:24.427621	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
469	2025-07-08 00:35:26.575609	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
470	2025-07-08 00:35:30.476436	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
471	2025-07-08 00:35:31.330297	/metrics	172.19.0.2	0	default
472	2025-07-08 00:35:34.469946	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
473	2025-07-08 00:35:38.107456	/api/geometry/icosahedron/initial	127.0.0.1	0	default
474	2025-07-08 00:35:38.566147	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
475	2025-07-08 00:35:42.559952	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
476	2025-07-08 00:35:44.510867	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
477	2025-07-08 00:35:46.330598	/metrics	172.19.0.2	0	default
478	2025-07-08 00:35:48.498511	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
479	2025-07-08 00:35:52.492604	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
480	2025-07-08 00:35:56.487033	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
481	2025-07-08 00:36:00.4794	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
482	2025-07-08 00:36:01.330873	/metrics	172.19.0.2	0	default
483	2025-07-08 00:36:04.473324	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
484	2025-07-08 00:36:06.514698	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
485	2025-07-08 00:36:08.189852	/api/geometry/icosahedron/initial	127.0.0.1	0	default
486	2025-07-08 00:36:10.514231	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
487	2025-07-08 00:36:14.426976	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
488	2025-07-08 00:36:16.330686	/metrics	172.19.0.2	0	default
489	2025-07-08 00:36:18.501351	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
490	2025-07-08 00:36:20.550578	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
491	2025-07-08 00:36:24.544532	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
492	2025-07-08 00:36:26.48934	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
493	2025-07-08 00:36:30.483727	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
494	2025-07-08 00:36:31.330703	/metrics	172.19.0.2	0	default
495	2025-07-08 00:36:34.476553	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
496	2025-07-08 00:36:38.260474	/api/geometry/icosahedron/initial	127.0.0.1	0	default
497	2025-07-08 00:36:38.562754	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
498	2025-07-08 00:36:42.56758	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
499	2025-07-08 00:36:46.330682	/metrics	172.19.0.2	0	default
500	2025-07-08 00:36:46.425272	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
501	2025-07-08 00:36:50.553257	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
502	2025-07-08 00:36:52.498985	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
503	2025-07-08 00:36:56.424997	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
504	2025-07-08 00:37:00.487029	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
505	2025-07-08 00:37:01.330953	/metrics	172.19.0.2	0	default
506	2025-07-08 00:37:04.480723	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
507	2025-07-08 00:37:08.330303	/api/geometry/icosahedron/initial	127.0.0.1	0	default
508	2025-07-08 00:37:08.473169	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
509	2025-07-08 00:37:12.467425	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
510	2025-07-08 00:37:16.33149	/metrics	172.19.0.2	0	default
511	2025-07-08 00:37:16.461709	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
512	2025-07-08 00:37:18.423707	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
513	2025-07-08 00:37:22.502914	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
514	2025-07-08 00:37:24.549728	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
515	2025-07-08 00:37:28.424502	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
516	2025-07-08 00:37:30.461081	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
517	2025-07-08 00:37:31.330186	/metrics	172.19.0.2	0	default
518	2025-07-08 00:37:34.483795	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
519	2025-07-08 00:37:38.399783	/api/geometry/icosahedron/initial	127.0.0.1	0	default
520	2025-07-08 00:37:38.474611	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
521	2025-07-08 00:37:40.526269	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
522	2025-07-08 00:37:44.519681	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
523	2025-07-08 00:37:46.329971	/metrics	172.19.0.2	0	default
524	2025-07-08 00:37:46.466349	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
525	2025-07-08 00:37:50.561324	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
526	2025-07-08 00:37:54.424786	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
527	2025-07-08 00:37:58.548439	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
528	2025-07-08 00:38:01.328914	/metrics	172.19.0.2	0	default
529	2025-07-08 00:38:02.441977	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
530	2025-07-08 00:38:06.439629	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
531	2025-07-08 00:38:08.483673	/api/geometry/icosahedron/initial	127.0.0.1	0	default
532	2025-07-08 00:38:10.438631	/api/geometry/metacube_oracle/animate	172.19.0.4	0	default
534	2025-07-08 00:38:31.330617	/metrics	172.19.0.2	0	default
535	2025-07-08 00:38:38.55202	/api/geometry/icosahedron/initial	127.0.0.1	0	default
536	2025-07-08 00:38:46.327067	/metrics	172.19.0.2	0	default
537	2025-07-08 00:39:01.330098	/metrics	172.19.0.2	0	default
538	2025-07-08 00:39:08.612187	/api/geometry/icosahedron/initial	127.0.0.1	0	default
539	2025-07-08 00:39:16.329578	/metrics	172.19.0.2	0	default
540	2025-07-08 00:39:31.329843	/metrics	172.19.0.2	0	default
541	2025-07-08 00:39:38.663205	/api/geometry/icosahedron/initial	127.0.0.1	0	default
542	2025-07-08 00:39:46.327451	/metrics	172.19.0.2	0	default
543	2025-07-08 00:40:01.331144	/metrics	172.19.0.2	0	default
544	2025-07-08 00:40:08.722492	/api/geometry/icosahedron/initial	127.0.0.1	0	default
545	2025-07-08 00:40:16.329378	/metrics	172.19.0.2	0	default
546	2025-07-08 00:40:31.328654	/metrics	172.19.0.2	0	default
547	2025-07-08 00:40:38.774666	/api/geometry/icosahedron/initial	127.0.0.1	0	default
548	2025-07-08 00:40:46.328467	/metrics	172.19.0.2	0	default
549	2025-07-08 00:41:01.331004	/metrics	172.19.0.2	0	default
550	2025-07-08 00:41:08.826633	/api/geometry/icosahedron/initial	127.0.0.1	0	default
551	2025-07-08 00:41:16.330261	/metrics	172.19.0.2	0	default
552	2025-07-08 00:41:31.330044	/metrics	172.19.0.2	0	default
553	2025-07-08 00:41:38.876725	/api/geometry/icosahedron/initial	127.0.0.1	0	default
554	2025-07-08 00:41:46.331986	/metrics	172.19.0.2	0	default
555	2025-07-08 00:41:53.37854	/api/geometry/metacube_oracle/animate	127.0.0.1	0	default
556	2025-07-08 00:42:01.330769	/metrics	172.19.0.2	0	default
557	2025-07-08 00:42:08.929017	/api/geometry/icosahedron/initial	127.0.0.1	0	default
558	2025-07-08 00:42:16.331317	/metrics	172.19.0.2	0	default
559	2025-07-08 00:42:31.331343	/metrics	172.19.0.2	0	default
560	2025-07-08 00:42:39.008615	/api/geometry/icosahedron/initial	127.0.0.1	0	default
561	2025-07-08 00:42:46.330988	/metrics	172.19.0.2	0	default
562	2025-07-08 00:43:01.331336	/metrics	172.19.0.2	0	default
563	2025-07-08 00:43:09.083683	/api/geometry/icosahedron/initial	127.0.0.1	0	default
564	2025-07-08 00:43:16.331073	/metrics	172.19.0.2	0	default
565	2025-07-08 00:43:31.330405	/metrics	172.19.0.2	0	default
566	2025-07-08 00:43:39.167092	/api/geometry/icosahedron/initial	127.0.0.1	0	default
567	2025-07-08 00:43:46.330559	/metrics	172.19.0.2	0	default
568	2025-07-08 00:44:01.331634	/metrics	172.19.0.2	0	default
569	2025-07-08 00:44:09.233619	/api/geometry/icosahedron/initial	127.0.0.1	0	default
570	2025-07-08 00:44:16.330046	/metrics	172.19.0.2	0	default
571	2025-07-08 00:44:31.330423	/metrics	172.19.0.2	0	default
572	2025-07-08 00:44:39.30684	/api/geometry/icosahedron/initial	127.0.0.1	0	default
573	2025-07-08 00:44:46.3313	/metrics	172.19.0.2	0	default
574	2025-07-08 00:45:01.331805	/metrics	172.19.0.2	0	default
575	2025-07-08 00:45:09.382686	/api/geometry/icosahedron/initial	127.0.0.1	0	default
576	2025-07-08 00:45:16.330031	/metrics	172.19.0.2	0	default
577	2025-07-08 00:45:31.329547	/metrics	172.19.0.2	0	default
578	2025-07-08 00:45:39.464042	/api/geometry/icosahedron/initial	127.0.0.1	0	default
579	2025-07-08 00:45:46.326159	/metrics	172.19.0.2	0	default
580	2025-07-08 00:46:01.329686	/metrics	172.19.0.2	0	default
581	2025-07-08 00:46:09.538565	/api/geometry/icosahedron/initial	127.0.0.1	0	default
582	2025-07-08 00:46:16.331924	/metrics	172.19.0.2	0	default
583	2025-07-08 00:46:31.330493	/metrics	172.19.0.2	0	default
584	2025-07-08 00:46:39.600625	/api/geometry/icosahedron/initial	127.0.0.1	0	default
585	2025-07-08 00:46:46.33063	/metrics	172.19.0.2	0	default
586	2025-07-08 00:47:01.331311	/metrics	172.19.0.2	0	default
587	2025-07-08 00:47:09.676879	/api/geometry/icosahedron/initial	127.0.0.1	0	default
588	2025-07-08 00:47:16.331436	/metrics	172.19.0.2	0	default
589	2025-07-08 00:47:31.331683	/metrics	172.19.0.2	0	default
590	2025-07-08 00:47:39.751916	/api/geometry/icosahedron/initial	127.0.0.1	0	default
591	2025-07-08 00:47:46.332027	/metrics	172.19.0.2	0	default
592	2025-07-08 00:48:01.330553	/metrics	172.19.0.2	0	default
593	2025-07-08 00:48:09.825669	/api/geometry/icosahedron/initial	127.0.0.1	0	default
594	2025-07-08 00:48:16.329964	/metrics	172.19.0.2	0	default
595	2025-07-08 00:48:31.330793	/metrics	172.19.0.2	0	default
596	2025-07-08 00:48:39.897251	/api/geometry/icosahedron/initial	127.0.0.1	0	default
597	2025-07-08 00:48:46.331026	/metrics	172.19.0.2	0	default
598	2025-07-08 00:49:01.327148	/metrics	172.19.0.2	0	default
599	2025-07-08 00:49:09.970374	/api/geometry/icosahedron/initial	127.0.0.1	0	default
600	2025-07-08 00:49:16.33074	/metrics	172.19.0.2	0	default
601	2025-07-08 00:49:31.331211	/metrics	172.19.0.2	0	default
602	2025-07-08 00:49:40.043611	/api/geometry/icosahedron/initial	127.0.0.1	0	default
603	2025-07-08 00:49:46.331359	/metrics	172.19.0.2	0	default
604	2025-07-08 00:50:01.330868	/metrics	172.19.0.2	0	default
605	2025-07-08 00:50:10.11559	/api/geometry/icosahedron/initial	127.0.0.1	0	default
606	2025-07-08 00:50:16.330858	/metrics	172.19.0.2	0	default
607	2025-07-08 00:50:31.331804	/metrics	172.19.0.2	0	default
608	2025-07-08 00:50:40.179975	/api/geometry/icosahedron/initial	127.0.0.1	0	default
609	2025-07-08 00:50:46.329792	/metrics	172.19.0.2	0	default
610	2025-07-08 00:51:01.330506	/metrics	172.19.0.2	0	default
611	2025-07-08 00:51:10.23157	/api/geometry/icosahedron/initial	127.0.0.1	0	default
612	2025-07-08 00:51:16.329333	/metrics	172.19.0.2	0	default
613	2025-07-08 00:51:31.330388	/metrics	172.19.0.2	0	default
614	2025-07-08 00:51:40.312738	/api/geometry/icosahedron/initial	127.0.0.1	0	default
615	2025-07-08 00:51:46.331007	/metrics	172.19.0.2	0	default
616	2025-07-08 00:52:01.331028	/metrics	172.19.0.2	0	default
617	2025-07-08 00:52:10.384865	/api/geometry/icosahedron/initial	127.0.0.1	0	default
618	2025-07-08 00:52:16.331291	/metrics	172.19.0.2	0	default
619	2025-07-08 00:52:31.33031	/metrics	172.19.0.2	0	default
620	2025-07-08 00:52:40.45323	/api/geometry/icosahedron/initial	127.0.0.1	0	default
621	2025-07-08 00:52:46.331034	/metrics	172.19.0.2	0	default
622	2025-07-08 00:53:01.332108	/metrics	172.19.0.2	0	default
623	2025-07-08 00:53:10.528471	/api/geometry/icosahedron/initial	127.0.0.1	0	default
624	2025-07-08 00:53:16.332367	/metrics	172.19.0.2	0	default
625	2025-07-08 00:53:31.331325	/metrics	172.19.0.2	0	default
626	2025-07-08 00:53:40.598521	/api/geometry/icosahedron/initial	127.0.0.1	0	default
627	2025-07-08 00:53:46.330836	/metrics	172.19.0.2	0	default
628	2025-07-08 00:54:01.331244	/metrics	172.19.0.2	0	default
629	2025-07-08 00:54:10.666901	/api/geometry/icosahedron/initial	127.0.0.1	0	default
630	2025-07-08 00:54:16.329511	/metrics	172.19.0.2	0	default
631	2025-07-08 00:54:31.327755	/metrics	172.19.0.2	0	default
632	2025-07-08 00:54:40.736133	/api/geometry/icosahedron/initial	127.0.0.1	0	default
633	2025-07-08 00:54:46.330161	/metrics	172.19.0.2	0	default
634	2025-07-08 00:55:01.330257	/metrics	172.19.0.2	0	default
635	2025-07-08 00:55:10.824838	/api/geometry/icosahedron/initial	127.0.0.1	0	default
636	2025-07-08 00:55:16.330548	/metrics	172.19.0.2	0	default
637	2025-07-08 00:55:31.3275	/metrics	172.19.0.2	0	default
638	2025-07-08 00:55:40.898813	/api/geometry/icosahedron/initial	127.0.0.1	0	default
639	2025-07-08 00:55:46.331681	/metrics	172.19.0.2	0	default
640	2025-07-08 00:56:01.331132	/metrics	172.19.0.2	0	default
641	2025-07-08 00:56:10.96677	/api/geometry/icosahedron/initial	127.0.0.1	0	default
642	2025-07-08 00:56:16.330267	/metrics	172.19.0.2	0	default
643	2025-07-08 00:56:31.329319	/metrics	172.19.0.2	0	default
644	2025-07-08 00:56:41.033401	/api/geometry/icosahedron/initial	127.0.0.1	0	default
645	2025-07-08 00:56:46.331304	/metrics	172.19.0.2	0	default
646	2025-07-08 00:57:01.327286	/metrics	172.19.0.2	0	default
647	2025-07-08 00:57:11.105429	/api/geometry/icosahedron/initial	127.0.0.1	0	default
648	2025-07-08 00:57:16.330737	/metrics	172.19.0.2	0	default
649	2025-07-08 00:57:31.330683	/metrics	172.19.0.2	0	default
650	2025-07-08 00:57:41.175781	/api/geometry/icosahedron/initial	127.0.0.1	0	default
651	2025-07-08 00:57:46.330312	/metrics	172.19.0.2	0	default
652	2025-07-08 00:58:01.331824	/metrics	172.19.0.2	0	default
653	2025-07-08 00:58:11.247261	/api/geometry/icosahedron/initial	127.0.0.1	0	default
654	2025-07-08 00:58:16.331639	/metrics	172.19.0.2	0	default
655	2025-07-08 00:58:31.330323	/metrics	172.19.0.2	0	default
656	2025-07-08 00:58:41.319589	/api/geometry/icosahedron/initial	127.0.0.1	0	default
657	2025-07-08 00:58:46.332147	/metrics	172.19.0.2	0	default
658	2025-07-08 00:59:01.330625	/metrics	172.19.0.2	0	default
659	2025-07-08 00:59:11.388436	/api/geometry/icosahedron/initial	127.0.0.1	0	default
660	2025-07-08 00:59:16.331299	/metrics	172.19.0.2	0	default
661	2025-07-08 00:59:31.32895	/metrics	172.19.0.2	0	default
662	2025-07-08 00:59:41.46051	/api/geometry/icosahedron/initial	127.0.0.1	0	default
663	2025-07-08 00:59:46.331078	/metrics	172.19.0.2	0	default
664	2025-07-08 01:00:01.330439	/metrics	172.19.0.2	0	default
665	2025-07-08 01:00:11.541631	/api/geometry/icosahedron/initial	127.0.0.1	0	default
666	2025-07-08 01:00:16.332227	/metrics	172.19.0.2	0	default
667	2025-07-08 01:00:31.330666	/metrics	172.19.0.2	0	default
668	2025-07-08 01:00:41.615435	/api/geometry/icosahedron/initial	127.0.0.1	0	default
669	2025-07-08 01:00:46.329264	/metrics	172.19.0.2	0	default
670	2025-07-08 01:01:01.331125	/metrics	172.19.0.2	0	default
671	2025-07-08 01:01:11.682478	/api/geometry/icosahedron/initial	127.0.0.1	0	default
672	2025-07-08 01:01:16.331863	/metrics	172.19.0.2	0	default
673	2025-07-08 01:01:31.332283	/metrics	172.19.0.2	0	default
674	2025-07-08 01:01:41.759542	/api/geometry/icosahedron/initial	127.0.0.1	0	default
675	2025-07-08 01:01:46.331092	/metrics	172.19.0.2	0	default
676	2025-07-08 01:02:01.327078	/metrics	172.19.0.2	0	default
677	2025-07-08 01:02:11.841273	/api/geometry/icosahedron/initial	127.0.0.1	0	default
678	2025-07-08 01:02:16.330535	/metrics	172.19.0.2	0	default
679	2025-07-08 01:02:31.330862	/metrics	172.19.0.2	0	default
680	2025-07-08 01:02:41.913869	/api/geometry/icosahedron/initial	127.0.0.1	0	default
681	2025-07-08 01:02:46.331033	/metrics	172.19.0.2	0	default
682	2025-07-08 01:03:01.331343	/metrics	172.19.0.2	0	default
683	2025-07-08 01:03:11.987503	/api/geometry/icosahedron/initial	127.0.0.1	0	default
684	2025-07-08 01:03:16.329711	/metrics	172.19.0.2	0	default
685	2025-07-08 01:03:31.331278	/metrics	172.19.0.2	0	default
686	2025-07-08 01:03:42.053862	/api/geometry/icosahedron/initial	127.0.0.1	0	default
688	2025-07-08 01:03:44.708858	/api/geometry/icosahedron/initial	172.19.0.4	0	default
687	2025-07-08 01:03:44.707723	/api/geometry/icosahedron/animate	172.19.0.4	0	default
689	2025-07-08 01:03:46.331197	/metrics	172.19.0.2	0	default
690	2025-07-08 01:03:46.518011	/api/geometry/spiral_simple/animate	172.19.0.4	0	default
691	2025-07-08 01:04:01.331067	/metrics	172.19.0.2	0	default
692	2025-07-08 01:04:12.135998	/api/geometry/icosahedron/initial	127.0.0.1	0	default
693	2025-07-08 01:04:16.330707	/metrics	172.19.0.2	0	default
694	2025-07-08 01:04:31.328807	/metrics	172.19.0.2	0	default
695	2025-07-08 01:04:42.213514	/api/geometry/icosahedron/initial	127.0.0.1	0	default
696	2025-07-08 01:04:46.330265	/metrics	172.19.0.2	0	default
697	2025-07-08 01:05:01.330356	/metrics	172.19.0.2	0	default
698	2025-07-08 01:05:12.282984	/api/geometry/icosahedron/initial	127.0.0.1	0	default
699	2025-07-08 01:05:16.330305	/metrics	172.19.0.2	0	default
700	2025-07-08 01:05:31.331386	/metrics	172.19.0.2	0	default
701	2025-07-08 01:05:42.361898	/api/geometry/icosahedron/initial	127.0.0.1	0	default
702	2025-07-08 01:05:46.331408	/metrics	172.19.0.2	0	default
703	2025-07-08 01:06:01.330627	/metrics	172.19.0.2	0	default
704	2025-07-08 01:06:12.428376	/api/geometry/icosahedron/initial	127.0.0.1	0	default
705	2025-07-08 01:06:16.330608	/metrics	172.19.0.2	0	default
706	2025-07-08 01:06:31.330009	/metrics	172.19.0.2	0	default
707	2025-07-08 01:06:42.494986	/api/geometry/icosahedron/initial	127.0.0.1	0	default
708	2025-07-08 01:06:46.330535	/metrics	172.19.0.2	0	default
709	2025-07-08 01:07:01.32822	/metrics	172.19.0.2	0	default
710	2025-07-08 01:07:12.560306	/api/geometry/icosahedron/initial	127.0.0.1	0	default
711	2025-07-08 01:07:16.330268	/metrics	172.19.0.2	0	default
712	2025-07-08 01:07:31.330823	/metrics	172.19.0.2	0	default
713	2025-07-08 01:07:42.635786	/api/geometry/icosahedron/initial	127.0.0.1	0	default
714	2025-07-08 01:07:46.331256	/metrics	172.19.0.2	0	default
715	2025-07-08 01:08:01.327738	/metrics	172.19.0.2	0	default
716	2025-07-08 01:08:12.698774	/api/geometry/icosahedron/initial	127.0.0.1	0	default
717	2025-07-08 01:08:16.330329	/metrics	172.19.0.2	0	default
718	2025-07-08 01:08:31.330068	/metrics	172.19.0.2	0	default
719	2025-07-08 01:08:42.775124	/api/geometry/icosahedron/initial	127.0.0.1	0	default
720	2025-07-08 01:08:46.330725	/metrics	172.19.0.2	0	default
721	2025-07-08 01:09:01.328033	/metrics	172.19.0.2	0	default
722	2025-07-08 01:09:12.859155	/api/geometry/icosahedron/initial	127.0.0.1	0	default
723	2025-07-08 01:09:16.330066	/metrics	172.19.0.2	0	default
724	2025-07-08 01:09:31.3293	/metrics	172.19.0.2	0	default
725	2025-07-08 01:09:42.934899	/api/geometry/icosahedron/initial	127.0.0.1	0	default
726	2025-07-08 01:09:46.330826	/metrics	172.19.0.2	0	default
727	2025-07-08 01:10:01.331058	/metrics	172.19.0.2	0	default
728	2025-07-08 01:10:13.005742	/api/geometry/icosahedron/initial	127.0.0.1	0	default
729	2025-07-08 01:10:16.331147	/metrics	172.19.0.2	0	default
730	2025-07-08 01:10:31.331083	/metrics	172.19.0.2	0	default
731	2025-07-08 01:10:43.075928	/api/geometry/icosahedron/initial	127.0.0.1	0	default
732	2025-07-08 01:10:46.330884	/metrics	172.19.0.2	0	default
733	2025-07-08 01:11:01.33086	/metrics	172.19.0.2	0	default
734	2025-07-08 01:11:13.144552	/api/geometry/icosahedron/initial	127.0.0.1	0	default
735	2025-07-08 01:11:16.330025	/metrics	172.19.0.2	0	default
736	2025-07-08 01:11:31.330915	/metrics	172.19.0.2	0	default
737	2025-07-08 01:11:43.211777	/api/geometry/icosahedron/initial	127.0.0.1	0	default
738	2025-07-08 01:11:46.331187	/metrics	172.19.0.2	0	default
739	2025-07-08 01:12:01.331187	/metrics	172.19.0.2	0	default
740	2025-07-08 01:12:13.289637	/api/geometry/icosahedron/initial	127.0.0.1	0	default
741	2025-07-08 01:12:16.32992	/metrics	172.19.0.2	0	default
742	2025-07-08 01:12:31.330797	/metrics	172.19.0.2	0	default
743	2025-07-08 01:12:43.366715	/api/geometry/icosahedron/initial	127.0.0.1	0	default
744	2025-07-08 01:12:46.330745	/metrics	172.19.0.2	0	default
745	2025-07-08 01:13:01.331429	/metrics	172.19.0.2	0	default
746	2025-07-08 01:13:13.436588	/api/geometry/icosahedron/initial	127.0.0.1	0	default
747	2025-07-08 01:13:16.329861	/metrics	172.19.0.2	0	default
748	2025-07-08 01:13:31.330581	/metrics	172.19.0.2	0	default
749	2025-07-08 01:13:43.509539	/api/geometry/icosahedron/initial	127.0.0.1	0	default
750	2025-07-08 01:13:46.32682	/metrics	172.19.0.2	0	default
751	2025-07-08 01:14:01.330557	/metrics	172.19.0.2	0	default
752	2025-07-08 01:14:13.573759	/api/geometry/icosahedron/initial	127.0.0.1	0	default
753	2025-07-08 01:14:16.331271	/metrics	172.19.0.2	0	default
754	2025-07-08 01:14:31.331057	/metrics	172.19.0.2	0	default
755	2025-07-08 01:14:43.642887	/api/geometry/icosahedron/initial	127.0.0.1	0	default
756	2025-07-08 01:14:46.33161	/metrics	172.19.0.2	0	default
757	2025-07-08 01:15:01.329936	/metrics	172.19.0.2	0	default
758	2025-07-08 01:15:13.712686	/api/geometry/icosahedron/initial	127.0.0.1	0	default
759	2025-07-08 01:15:16.330915	/metrics	172.19.0.2	0	default
760	2025-07-08 01:15:31.332166	/metrics	172.19.0.2	0	default
761	2025-07-08 01:15:43.77891	/api/geometry/icosahedron/initial	127.0.0.1	0	default
762	2025-07-08 01:15:46.330684	/metrics	172.19.0.2	0	default
763	2025-07-08 01:16:01.329565	/metrics	172.19.0.2	0	default
764	2025-07-08 01:16:13.844333	/api/geometry/icosahedron/initial	127.0.0.1	0	default
765	2025-07-08 01:16:16.330566	/metrics	172.19.0.2	0	default
766	2025-07-08 01:16:31.330652	/metrics	172.19.0.2	0	default
767	2025-07-08 01:16:43.920106	/api/geometry/icosahedron/initial	127.0.0.1	0	default
768	2025-07-08 01:16:46.330341	/metrics	172.19.0.2	0	default
769	2025-07-08 01:17:01.330319	/metrics	172.19.0.2	0	default
770	2025-07-08 01:17:13.998482	/api/geometry/icosahedron/initial	127.0.0.1	0	default
771	2025-07-08 01:17:16.330948	/metrics	172.19.0.2	0	default
772	2025-07-08 01:17:31.330592	/metrics	172.19.0.2	0	default
773	2025-07-08 01:17:44.071815	/api/geometry/icosahedron/initial	127.0.0.1	0	default
774	2025-07-08 01:17:46.331075	/metrics	172.19.0.2	0	default
775	2025-07-08 01:18:01.330526	/metrics	172.19.0.2	0	default
776	2025-07-08 01:18:14.131503	/api/geometry/icosahedron/initial	127.0.0.1	0	default
777	2025-07-08 01:18:16.331036	/metrics	172.19.0.2	0	default
778	2025-07-08 01:18:31.328815	/metrics	172.19.0.2	0	default
779	2025-07-08 01:18:44.215991	/api/geometry/icosahedron/initial	127.0.0.1	0	default
780	2025-07-08 01:18:46.330029	/metrics	172.19.0.2	0	default
781	2025-07-08 01:19:01.329657	/metrics	172.19.0.2	0	default
782	2025-07-08 01:19:14.287378	/api/geometry/icosahedron/initial	127.0.0.1	0	default
783	2025-07-08 01:19:16.330353	/metrics	172.19.0.2	0	default
784	2025-07-08 01:19:31.330762	/metrics	172.19.0.2	0	default
785	2025-07-08 01:19:44.362876	/api/geometry/icosahedron/initial	127.0.0.1	0	default
786	2025-07-08 01:19:46.330635	/metrics	172.19.0.2	0	default
787	2025-07-08 01:20:01.330684	/metrics	172.19.0.2	0	default
788	2025-07-08 01:20:14.43401	/api/geometry/icosahedron/initial	127.0.0.1	0	default
789	2025-07-08 01:20:16.3305	/metrics	172.19.0.2	0	default
790	2025-07-08 01:20:31.329044	/metrics	172.19.0.2	0	default
791	2025-07-08 01:20:44.49792	/api/geometry/icosahedron/initial	127.0.0.1	0	default
792	2025-07-08 01:20:46.330782	/metrics	172.19.0.2	0	default
793	2025-07-08 01:21:01.329783	/metrics	172.19.0.2	0	default
794	2025-07-08 01:21:14.574979	/api/geometry/icosahedron/initial	127.0.0.1	0	default
795	2025-07-08 01:21:16.32618	/metrics	172.19.0.2	0	default
796	2025-07-08 01:21:31.331353	/metrics	172.19.0.2	0	default
797	2025-07-08 01:21:44.644555	/api/geometry/icosahedron/initial	127.0.0.1	0	default
798	2025-07-08 01:21:46.330997	/metrics	172.19.0.2	0	default
799	2025-07-08 01:22:01.330877	/metrics	172.19.0.2	0	default
800	2025-07-08 01:22:14.719137	/api/geometry/icosahedron/initial	127.0.0.1	0	default
801	2025-07-08 01:22:16.330095	/metrics	172.19.0.2	0	default
802	2025-07-08 01:22:31.329324	/metrics	172.19.0.2	0	default
803	2025-07-08 01:22:44.788513	/api/geometry/icosahedron/initial	127.0.0.1	0	default
804	2025-07-08 01:22:46.329748	/metrics	172.19.0.2	0	default
805	2025-07-08 01:23:01.330204	/metrics	172.19.0.2	0	default
806	2025-07-08 01:23:14.86148	/api/geometry/icosahedron/initial	127.0.0.1	0	default
807	2025-07-08 01:23:16.329164	/metrics	172.19.0.2	0	default
808	2025-07-08 01:23:31.33061	/metrics	172.19.0.2	0	default
809	2025-07-08 01:23:44.930672	/api/geometry/icosahedron/initial	127.0.0.1	0	default
810	2025-07-08 01:23:46.330016	/metrics	172.19.0.2	0	default
811	2025-07-08 01:24:01.331737	/metrics	172.19.0.2	0	default
812	2025-07-08 01:24:15.001675	/api/geometry/icosahedron/initial	127.0.0.1	0	default
813	2025-07-08 01:24:16.33086	/metrics	172.19.0.2	0	default
814	2025-07-08 01:24:31.330439	/metrics	172.19.0.2	0	default
815	2025-07-08 01:24:45.073388	/api/geometry/icosahedron/initial	127.0.0.1	0	default
816	2025-07-08 01:24:46.331583	/metrics	172.19.0.2	0	default
817	2025-07-08 01:25:01.330449	/metrics	172.19.0.2	0	default
818	2025-07-08 01:25:15.145135	/api/geometry/icosahedron/initial	127.0.0.1	0	default
819	2025-07-08 01:25:16.329686	/metrics	172.19.0.2	0	default
820	2025-07-08 01:25:31.329931	/metrics	172.19.0.2	0	default
821	2025-07-08 01:25:45.213242	/api/geometry/icosahedron/initial	127.0.0.1	0	default
822	2025-07-08 01:25:46.330364	/metrics	172.19.0.2	0	default
\.


--
-- Name: visites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: oracle_user
--

SELECT pg_catalog.setval('public.visites_id_seq', 822, true);


--
-- Name: visites visites_pkey; Type: CONSTRAINT; Schema: public; Owner: oracle_user
--

ALTER TABLE ONLY public.visites
    ADD CONSTRAINT visites_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

