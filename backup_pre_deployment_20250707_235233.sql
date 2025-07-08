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
1	2025-07-07 23:05:34.174566	/api/geometry/icosahedron/animate	172.19.0.2	0	default
59	2025-07-07 23:07:22.70231	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
81	2025-07-07 23:08:26.599922	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
103	2025-07-07 23:09:30.601125	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
125	2025-07-07 23:10:40.643963	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
152	2025-07-07 23:19:12.687713	/api/geometry/icosahedron/initial	127.0.0.1	0	default
174	2025-07-07 23:30:14.299783	/api/geometry/icosahedron/initial	127.0.0.1	0	default
196	2025-07-07 23:41:15.858877	/api/geometry/icosahedron/initial	127.0.0.1	0	default
211	2025-07-07 23:49:37.550143	/api/geometry/icosahedron/initial	127.0.0.1	0	default
3	2025-07-07 23:05:35.283165	/api/geometry/spiral_simple/animate	172.19.0.2	0	default
23	2025-07-07 23:05:43.372494	/api/geometry/icosahedron/animate	172.19.0.2	0	default
43	2025-07-07 23:06:38.670707	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
60	2025-07-07 23:07:24.64847	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
82	2025-07-07 23:08:30.697292	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
104	2025-07-07 23:09:34.695968	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
126	2025-07-07 23:10:42.964858	/api/geometry/icosahedron/initial	127.0.0.1	0	default
153	2025-07-07 23:19:42.76881	/api/geometry/icosahedron/initial	127.0.0.1	0	default
175	2025-07-07 23:30:44.375723	/api/geometry/icosahedron/initial	127.0.0.1	0	default
197	2025-07-07 23:41:45.922809	/api/geometry/icosahedron/initial	127.0.0.1	0	default
212	2025-07-07 23:50:07.631883	/api/geometry/icosahedron/initial	127.0.0.1	0	default
4	2025-07-07 23:05:37.127509	/api/geometry/crypto_token_river/animate	172.19.0.2	0	default
24	2025-07-07 23:05:45.422795	/api/generate_token	172.19.0.2	0	default
44	2025-07-07 23:06:42.330813	/api/geometry/icosahedron/initial	127.0.0.1	0	default
61	2025-07-07 23:07:28.642439	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
83	2025-07-07 23:08:34.690867	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
105	2025-07-07 23:09:38.691448	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
127	2025-07-07 23:10:44.63632	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
154	2025-07-07 23:20:12.844702	/api/geometry/icosahedron/initial	127.0.0.1	0	default
176	2025-07-07 23:31:14.448482	/api/geometry/icosahedron/initial	127.0.0.1	0	default
198	2025-07-07 23:42:15.998703	/api/geometry/icosahedron/initial	127.0.0.1	0	default
213	2025-07-07 23:50:37.708814	/api/geometry/icosahedron/initial	127.0.0.1	0	default
5	2025-07-07 23:05:37.580075	/api/geometry/torus_spring/animate	172.19.0.2	0	default
25	2025-07-07 23:05:46.651236	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
45	2025-07-07 23:06:42.563124	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
62	2025-07-07 23:07:32.636172	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
84	2025-07-07 23:08:36.636601	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
106	2025-07-07 23:09:42.684625	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
128	2025-07-07 23:10:46.686027	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
155	2025-07-07 23:20:42.924476	/api/geometry/icosahedron/initial	127.0.0.1	0	default
177	2025-07-07 23:31:44.511987	/api/geometry/icosahedron/initial	127.0.0.1	0	default
199	2025-07-07 23:42:46.075568	/api/geometry/icosahedron/initial	127.0.0.1	0	default
214	2025-07-07 23:51:07.775756	/api/geometry/icosahedron/initial	127.0.0.1	0	default
6	2025-07-07 23:05:38.152028	/api/geometry/centrifuge_laser_v2/animate	172.19.0.2	0	default
26	2025-07-07 23:05:48.69823	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
46	2025-07-07 23:06:44.609985	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
63	2025-07-07 23:07:34.684319	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
85	2025-07-07 23:08:40.560214	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
107	2025-07-07 23:09:42.801174	/api/geometry/icosahedron/initial	127.0.0.1	0	default
129	2025-07-07 23:10:50.679083	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
156	2025-07-07 23:21:12.990024	/api/geometry/icosahedron/initial	127.0.0.1	0	default
178	2025-07-07 23:32:14.584681	/api/geometry/icosahedron/initial	127.0.0.1	0	default
200	2025-07-07 23:43:16.145184	/api/geometry/icosahedron/initial	127.0.0.1	0	default
215	2025-07-07 23:51:37.837891	/api/geometry/icosahedron/initial	127.0.0.1	0	default
7	2025-07-07 23:05:38.181124	/api/geometry/centrifuge_laser_v2/animate	172.19.0.2	0	default
27	2025-07-07 23:05:52.564876	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
47	2025-07-07 23:06:48.706354	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
64	2025-07-07 23:07:38.678167	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
86	2025-07-07 23:08:42.654902	/api/geometry/icosahedron/initial	127.0.0.1	0	default
108	2025-07-07 23:09:44.732733	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
130	2025-07-07 23:10:53.431309	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
157	2025-07-07 23:21:43.058194	/api/geometry/icosahedron/initial	127.0.0.1	0	default
179	2025-07-07 23:32:44.658549	/api/geometry/icosahedron/initial	127.0.0.1	0	default
201	2025-07-07 23:43:46.226659	/api/geometry/icosahedron/initial	127.0.0.1	0	default
216	2025-07-07 23:52:07.913238	/api/geometry/icosahedron/initial	127.0.0.1	0	default
8	2025-07-07 23:05:38.219551	/api/geometry/centrifuge_laser_v2/animate	172.19.0.2	0	default
28	2025-07-07 23:05:54.536621	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
48	2025-07-07 23:06:50.564516	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
65	2025-07-07 23:07:40.623376	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
87	2025-07-07 23:08:44.928751	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
109	2025-07-07 23:09:48.62141	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
131	2025-07-07 23:10:54.467373	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
136	2025-07-07 23:17:12.392409	/api/geometry/icosahedron/initial	127.0.0.1	0	default
158	2025-07-07 23:22:13.131366	/api/geometry/icosahedron/initial	127.0.0.1	0	default
180	2025-07-07 23:33:14.730518	/api/geometry/icosahedron/initial	127.0.0.1	0	default
202	2025-07-07 23:44:16.290209	/api/geometry/icosahedron/initial	127.0.0.1	0	default
9	2025-07-07 23:05:38.316828	/api/geometry/centrifuge_laser_v2/animate	172.19.0.2	0	default
29	2025-07-07 23:05:56.68655	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
49	2025-07-07 23:06:54.542309	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
66	2025-07-07 23:07:42.488699	/api/geometry/icosahedron/initial	127.0.0.1	0	default
88	2025-07-07 23:08:48.618799	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
110	2025-07-07 23:09:52.618064	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
132	2025-07-07 23:10:54.740743	/api/geometry/crypto_token_river/animate	172.19.0.2	0	default
137	2025-07-07 23:17:42.496048	/api/geometry/icosahedron/initial	127.0.0.1	0	default
159	2025-07-07 23:22:43.215254	/api/geometry/icosahedron/initial	127.0.0.1	0	default
181	2025-07-07 23:33:44.794519	/api/geometry/icosahedron/initial	127.0.0.1	0	default
203	2025-07-07 23:44:46.366509	/api/geometry/icosahedron/initial	127.0.0.1	0	default
10	2025-07-07 23:05:38.417547	/api/geometry/centrifuge_laser_v2/animate	172.19.0.2	0	default
30	2025-07-07 23:05:57.432744	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
50	2025-07-07 23:06:54.560293	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
67	2025-07-07 23:07:44.618855	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
89	2025-07-07 23:08:50.663928	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
111	2025-07-07 23:09:54.56458	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
133	2025-07-07 23:10:55.49682	/api/geometry/spiral_simple/animate	172.19.0.2	0	default
138	2025-07-07 23:18:12.548719	/api/geometry/icosahedron/initial	127.0.0.1	0	default
160	2025-07-07 23:23:13.281014	/api/geometry/icosahedron/initial	127.0.0.1	0	default
182	2025-07-07 23:34:14.865329	/api/geometry/icosahedron/initial	127.0.0.1	0	default
204	2025-07-07 23:45:16.439998	/api/geometry/icosahedron/initial	127.0.0.1	0	default
11	2025-07-07 23:05:38.532197	/api/geometry/centrifuge_laser_v2/animate	172.19.0.2	0	default
31	2025-07-07 23:06:00.680378	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
51	2025-07-07 23:06:56.562265	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
68	2025-07-07 23:07:48.610747	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
90	2025-07-07 23:08:54.556895	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
112	2025-07-07 23:09:56.601343	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
134	2025-07-07 23:10:57.427944	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
139	2025-07-07 23:18:37.791244	/api/geometry/icosahedron/animate	172.19.0.3	0	default
161	2025-07-07 23:23:43.349755	/api/geometry/icosahedron/initial	127.0.0.1	0	default
183	2025-07-07 23:34:44.932592	/api/geometry/icosahedron/initial	127.0.0.1	0	default
205	2025-07-07 23:45:46.50026	/api/geometry/icosahedron/initial	127.0.0.1	0	default
12	2025-07-07 23:05:38.634257	/api/geometry/centrifuge_laser_v2/animate	172.19.0.2	0	default
32	2025-07-07 23:06:04.673746	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
52	2025-07-07 23:07:00.687481	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
69	2025-07-07 23:07:52.608013	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
91	2025-07-07 23:08:54.559623	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
113	2025-07-07 23:09:57.533385	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
135	2025-07-07 23:11:01.531249	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
140	2025-07-07 23:18:37.792932	/api/geometry/icosahedron/initial	172.19.0.3	0	default
162	2025-07-07 23:24:13.426081	/api/geometry/icosahedron/initial	127.0.0.1	0	default
184	2025-07-07 23:35:14.998356	/api/geometry/icosahedron/initial	127.0.0.1	0	default
206	2025-07-07 23:46:16.568307	/api/geometry/icosahedron/initial	127.0.0.1	0	default
13	2025-07-07 23:05:38.749994	/api/geometry/centrifuge_laser_v2/animate	172.19.0.2	0	default
33	2025-07-07 23:06:06.566797	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
53	2025-07-07 23:07:04.680831	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
70	2025-07-07 23:07:54.547479	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
92	2025-07-07 23:08:58.651325	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
114	2025-07-07 23:10:00.60562	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
141	2025-07-07 23:18:39.177277	/api/geometry/spiral_simple/animate	172.19.0.3	0	default
163	2025-07-07 23:24:43.49298	/api/geometry/icosahedron/initial	127.0.0.1	0	default
185	2025-07-07 23:35:45.071824	/api/geometry/icosahedron/initial	127.0.0.1	0	default
207	2025-07-07 23:46:46.641694	/api/geometry/icosahedron/initial	127.0.0.1	0	default
14	2025-07-07 23:05:38.850984	/api/geometry/centrifuge_laser_v2/animate	172.19.0.2	0	default
34	2025-07-07 23:06:10.86025	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
54	2025-07-07 23:07:08.562454	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
71	2025-07-07 23:07:56.699526	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
93	2025-07-07 23:09:02.644916	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
115	2025-07-07 23:10:04.559716	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
142	2025-07-07 23:18:40.576385	/api/geometry/centrifuge_laser/animate	172.19.0.3	0	default
164	2025-07-07 23:25:13.567419	/api/geometry/icosahedron/initial	127.0.0.1	0	default
186	2025-07-07 23:36:15.13695	/api/geometry/icosahedron/initial	127.0.0.1	0	default
208	2025-07-07 23:47:16.700032	/api/geometry/icosahedron/initial	127.0.0.1	0	default
15	2025-07-07 23:05:38.987674	/api/geometry/centrifuge_laser/animate	172.19.0.2	0	default
35	2025-07-07 23:06:12.246335	/api/geometry/icosahedron/initial	127.0.0.1	0	default
55	2025-07-07 23:07:12.413006	/api/geometry/icosahedron/initial	127.0.0.1	0	default
72	2025-07-07 23:07:57.518776	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
94	2025-07-07 23:09:06.640022	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
116	2025-07-07 23:10:08.565343	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
143	2025-07-07 23:18:41.060625	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
165	2025-07-07 23:25:43.643107	/api/geometry/icosahedron/initial	127.0.0.1	0	default
187	2025-07-07 23:36:45.207852	/api/geometry/icosahedron/initial	127.0.0.1	0	default
209	2025-07-07 23:47:46.772559	/api/geometry/icosahedron/initial	127.0.0.1	0	default
16	2025-07-07 23:05:40.603504	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
36	2025-07-07 23:06:14.564115	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
56	2025-07-07 23:07:12.564153	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
73	2025-07-07 23:08:00.694648	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
95	2025-07-07 23:09:08.687822	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
117	2025-07-07 23:10:12.687774	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
144	2025-07-07 23:18:41.31174	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
166	2025-07-07 23:26:13.718923	/api/geometry/icosahedron/initial	127.0.0.1	0	default
188	2025-07-07 23:37:15.287791	/api/geometry/icosahedron/initial	127.0.0.1	0	default
210	2025-07-07 23:48:16.836839	/api/geometry/icosahedron/initial	127.0.0.1	0	default
17	2025-07-07 23:05:40.786039	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
37	2025-07-07 23:06:18.563987	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
57	2025-07-07 23:07:16.564868	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
74	2025-07-07 23:08:04.687326	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
96	2025-07-07 23:09:12.679384	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
118	2025-07-07 23:10:12.88705	/api/geometry/icosahedron/initial	127.0.0.1	0	default
145	2025-07-07 23:18:41.605543	/api/geometry/torus_spring/animate	172.19.0.3	0	default
167	2025-07-07 23:26:43.791917	/api/geometry/icosahedron/initial	127.0.0.1	0	default
189	2025-07-07 23:37:45.353139	/api/geometry/icosahedron/initial	127.0.0.1	0	default
18	2025-07-07 23:05:41.632533	/api/geometry/crypto_token_river/animate	172.19.0.2	0	default
38	2025-07-07 23:06:20.563449	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
58	2025-07-07 23:07:18.566903	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
75	2025-07-07 23:08:08.681562	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
97	2025-07-07 23:09:12.734387	/api/geometry/icosahedron/initial	127.0.0.1	0	default
119	2025-07-07 23:10:16.681685	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
146	2025-07-07 23:18:41.61145	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
168	2025-07-07 23:27:13.862499	/api/geometry/icosahedron/initial	127.0.0.1	0	default
190	2025-07-07 23:38:15.417094	/api/geometry/icosahedron/initial	127.0.0.1	0	default
19	2025-07-07 23:05:42.13533	/api/geometry/spiral_simple/animate	172.19.0.2	0	default
39	2025-07-07 23:06:24.642011	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
76	2025-07-07 23:08:12.578308	/api/geometry/icosahedron/initial	127.0.0.1	0	default
98	2025-07-07 23:09:14.626681	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
120	2025-07-07 23:10:20.666265	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
147	2025-07-07 23:18:41.671126	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
169	2025-07-07 23:27:43.92759	/api/geometry/icosahedron/initial	127.0.0.1	0	default
191	2025-07-07 23:38:45.487515	/api/geometry/icosahedron/initial	127.0.0.1	0	default
20	2025-07-07 23:05:42.166814	/api/geometry/icosahedron/initial	127.0.0.1	0	default
40	2025-07-07 23:06:26.565186	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
77	2025-07-07 23:08:12.673131	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
99	2025-07-07 23:09:18.558907	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
121	2025-07-07 23:10:24.667981	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
148	2025-07-07 23:18:41.726521	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
170	2025-07-07 23:28:14.004004	/api/geometry/icosahedron/initial	127.0.0.1	0	default
192	2025-07-07 23:39:15.568923	/api/geometry/icosahedron/initial	127.0.0.1	0	default
21	2025-07-07 23:05:42.656904	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
41	2025-07-07 23:06:30.683328	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
78	2025-07-07 23:08:14.619278	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
100	2025-07-07 23:09:20.668413	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
122	2025-07-07 23:10:28.662778	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
149	2025-07-07 23:18:41.751019	/api/geometry/centrifuge_laser_v2/animate	172.19.0.3	0	default
171	2025-07-07 23:28:44.080298	/api/geometry/icosahedron/initial	127.0.0.1	0	default
193	2025-07-07 23:39:45.638739	/api/geometry/icosahedron/initial	127.0.0.1	0	default
22	2025-07-07 23:05:43.371615	/api/geometry/icosahedron/initial	172.19.0.2	0	default
42	2025-07-07 23:06:34.673852	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
79	2025-07-07 23:08:18.613848	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
101	2025-07-07 23:09:24.661572	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
123	2025-07-07 23:10:32.655669	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
150	2025-07-07 23:18:42.016023	/api/geometry/crypto_token_river/animate	172.19.0.3	0	default
172	2025-07-07 23:29:14.151925	/api/geometry/icosahedron/initial	127.0.0.1	0	default
194	2025-07-07 23:40:15.709035	/api/geometry/icosahedron/initial	127.0.0.1	0	default
2	2025-07-07 23:05:34.175261	/api/geometry/icosahedron/initial	172.19.0.2	0	default
80	2025-07-07 23:08:22.606553	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
102	2025-07-07 23:09:26.917146	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
124	2025-07-07 23:10:36.649128	/api/geometry/metacube_oracle/animate	172.19.0.2	0	default
151	2025-07-07 23:18:42.613705	/api/geometry/icosahedron/initial	127.0.0.1	0	default
173	2025-07-07 23:29:44.232771	/api/geometry/icosahedron/initial	127.0.0.1	0	default
195	2025-07-07 23:40:45.786938	/api/geometry/icosahedron/initial	127.0.0.1	0	default
\.


--
-- Name: visites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: oracle_user
--

SELECT pg_catalog.setval('public.visites_id_seq', 216, true);


--
-- Name: visites visites_pkey; Type: CONSTRAINT; Schema: public; Owner: oracle_user
--

ALTER TABLE ONLY public.visites
    ADD CONSTRAINT visites_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

