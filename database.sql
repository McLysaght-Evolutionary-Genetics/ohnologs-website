--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: niezabil
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO niezabil;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: niezabil
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Gene; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."Gene" (
    id text NOT NULL,
    "geneId" text NOT NULL,
    "proteinId" text NOT NULL,
    start integer NOT NULL,
    "end" integer NOT NULL,
    "scaffoldId" text NOT NULL
);


ALTER TABLE public."Gene" OWNER TO niezabil;

--
-- Name: GeneLabel; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."GeneLabel" (
    "geneId" text NOT NULL,
    "labelId" text NOT NULL
);


ALTER TABLE public."GeneLabel" OWNER TO niezabil;

--
-- Name: GeneTree; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."GeneTree" (
    id text NOT NULL,
    file text NOT NULL,
    newick text NOT NULL
);


ALTER TABLE public."GeneTree" OWNER TO niezabil;

--
-- Name: Genome; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."Genome" (
    id text NOT NULL,
    species text NOT NULL,
    version text NOT NULL,
    "stateId" text NOT NULL,
    "sourceId" text NOT NULL
);


ALTER TABLE public."Genome" OWNER TO niezabil;

--
-- Name: GenomeSource; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."GenomeSource" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."GenomeSource" OWNER TO niezabil;

--
-- Name: GenomeState; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."GenomeState" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."GenomeState" OWNER TO niezabil;

--
-- Name: Homology; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."Homology" (
    id text NOT NULL,
    "queryId" text NOT NULL,
    "subjectId" text NOT NULL
);


ALTER TABLE public."Homology" OWNER TO niezabil;

--
-- Name: Label; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."Label" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Label" OWNER TO niezabil;

--
-- Name: Scaffold; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."Scaffold" (
    id text NOT NULL,
    name text NOT NULL,
    length integer NOT NULL,
    "genomeId" text NOT NULL,
    "speciesId" text
);


ALTER TABLE public."Scaffold" OWNER TO niezabil;

--
-- Name: Segment; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."Segment" (
    id text NOT NULL,
    name text NOT NULL,
    start integer NOT NULL,
    "end" integer NOT NULL,
    "scaffoldId" text NOT NULL
);


ALTER TABLE public."Segment" OWNER TO niezabil;

--
-- Name: Species; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."Species" (
    id text NOT NULL,
    name text NOT NULL,
    source text NOT NULL,
    version text NOT NULL,
    state text NOT NULL
);


ALTER TABLE public."Species" OWNER TO niezabil;

--
-- Name: TreeGene; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."TreeGene" (
    "treeId" text NOT NULL,
    "geneId" text NOT NULL
);


ALTER TABLE public."TreeGene" OWNER TO niezabil;

--
-- Name: TreeSpecies; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public."TreeSpecies" (
    "treeId" text NOT NULL,
    "speciesId" text NOT NULL
);


ALTER TABLE public."TreeSpecies" OWNER TO niezabil;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: niezabil
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO niezabil;

--
-- Data for Name: Gene; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."Gene" (id, "geneId", "proteinId", start, "end", "scaffoldId") FROM stdin;
f3ad050d-fc43-4f81-8cbf-cb6c32bb9f42	ha	pha	0	450	141f96b1-9a6e-4077-831c-2d52fd37b37e
e74ebbf5-a574-4142-bc12-6d90901b68da	hb	phb	50	800	141f96b1-9a6e-4077-831c-2d52fd37b37e
e5a9d06a-1f03-450a-bccb-7be873337493	hc	phc	200	550	141f96b1-9a6e-4077-831c-2d52fd37b37e
c9c5a37a-e5b1-4db8-b9ff-b8429c1d694e	hd	phd	50	1500	141f96b1-9a6e-4077-831c-2d52fd37b37e
f6fde819-4ffd-4abd-a691-9f1bcaed6668	he	phe	500	650	581defb2-c769-44c9-98bf-1638758474c5
8428bec7-a00c-448c-967a-386ae169a501	hf	phf	400	700	581defb2-c769-44c9-98bf-1638758474c5
4ecb05c1-2c32-478c-bd38-c6ab4e1d3781	hg	phg	350	550	e8200bc1-b227-4808-9c61-f61c05a80980
5a5d0351-27f7-4b07-986a-a326049d91d3	hh	phh	250	350	e8200bc1-b227-4808-9c61-f61c05a80980
3314c7c4-3be0-4938-8f66-561c2ffde264	hi	phi	1500	1900	141f96b1-9a6e-4077-831c-2d52fd37b37e
1beac16e-5ed4-48c8-8fa7-de9fd0e5e97c	hj	phi	1050	1500	e8200bc1-b227-4808-9c61-f61c05a80980
9089aa50-83ab-43e8-b19a-2dc2f74155c3	ma	pma	1400	1450	88b0e040-64e6-42c2-8491-c725cb13cc8c
5a1abd9c-3152-4daf-ad94-ad7f7de345f8	mb	pmb	400	500	88b0e040-64e6-42c2-8491-c725cb13cc8c
bf2d43c7-b6e8-4ac5-a479-3079fb653abc	mc	pmc	250	350	88b0e040-64e6-42c2-8491-c725cb13cc8c
c162c813-1ed6-4c6a-84d1-f6fde501e894	md	pmd	780	800	88b0e040-64e6-42c2-8491-c725cb13cc8c
54ccd557-f776-4dc5-8b2d-348286a47ba3	me	pme	500	1500	88b0e040-64e6-42c2-8491-c725cb13cc8c
b32e6d3b-796c-4c73-984e-2c799a1d6f84	mf	pmf	200	800	d3cbc261-3cc2-4e9a-85a5-55142907e70b
ce3d8470-16ae-451a-b8d8-994f86506d17	mg	pmg	0	40	88b0e040-64e6-42c2-8491-c725cb13cc8c
a3aa954a-1126-43bc-85e8-a4eadf0c280c	mh	pmh	600	650	d3cbc261-3cc2-4e9a-85a5-55142907e70b
c2aa9381-b7b6-48b0-883e-6c4da2e023df	mi	pmi	850	1400	d3cbc261-3cc2-4e9a-85a5-55142907e70b
3a40c28d-12c2-40c4-a466-0371c2ef06f9	mj	pmj	1400	1450	d3cbc261-3cc2-4e9a-85a5-55142907e70b
\.


--
-- Data for Name: GeneLabel; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."GeneLabel" ("geneId", "labelId") FROM stdin;
3314c7c4-3be0-4938-8f66-561c2ffde264	1fbf6852-9437-41d2-b2c6-28b8e7735c2c
c2aa9381-b7b6-48b0-883e-6c4da2e023df	a33406f5-f827-4d72-9895-646968610d83
3314c7c4-3be0-4938-8f66-561c2ffde264	59993ad8-7f1d-45bb-a4c0-21ff6cf48b29
5a5d0351-27f7-4b07-986a-a326049d91d3	a33406f5-f827-4d72-9895-646968610d83
f6fde819-4ffd-4abd-a691-9f1bcaed6668	59993ad8-7f1d-45bb-a4c0-21ff6cf48b29
f3ad050d-fc43-4f81-8cbf-cb6c32bb9f42	1fbf6852-9437-41d2-b2c6-28b8e7735c2c
e74ebbf5-a574-4142-bc12-6d90901b68da	a33406f5-f827-4d72-9895-646968610d83
e74ebbf5-a574-4142-bc12-6d90901b68da	59993ad8-7f1d-45bb-a4c0-21ff6cf48b29
\.


--
-- Data for Name: GeneTree; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."GeneTree" (id, file, newick) FROM stdin;
\.


--
-- Data for Name: Genome; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."Genome" (id, species, version, "stateId", "sourceId") FROM stdin;
46b7d55d-dde1-43a3-8a62-037bbe9f52c8	human	108	47ca757e-7fd7-4b66-af0c-88b2555b391d	234c393e-e97b-465f-a7dc-189de07f5a39
77c6c365-69b5-48b0-8a65-9d6bc6c2dec7	mouse	108	47ca757e-7fd7-4b66-af0c-88b2555b391d	234c393e-e97b-465f-a7dc-189de07f5a39
\.


--
-- Data for Name: GenomeSource; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."GenomeSource" (id, name) FROM stdin;
234c393e-e97b-465f-a7dc-189de07f5a39	
\.


--
-- Data for Name: GenomeState; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."GenomeState" (id, name) FROM stdin;
47ca757e-7fd7-4b66-af0c-88b2555b391d	present
\.


--
-- Data for Name: Homology; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."Homology" (id, "queryId", "subjectId") FROM stdin;
8da1e5dd-e5c8-4350-b65e-24398471e9a2	5a1abd9c-3152-4daf-ad94-ad7f7de345f8	bf2d43c7-b6e8-4ac5-a479-3079fb653abc
c69ba236-300c-47a9-a06b-c58eefb7ffb6	9089aa50-83ab-43e8-b19a-2dc2f74155c3	9089aa50-83ab-43e8-b19a-2dc2f74155c3
5b9bea38-5d6b-415b-a407-f6d96d192d4e	3a40c28d-12c2-40c4-a466-0371c2ef06f9	1beac16e-5ed4-48c8-8fa7-de9fd0e5e97c
d1ffba5a-d472-4eb8-9772-c0e2c31b46f3	ce3d8470-16ae-451a-b8d8-994f86506d17	e74ebbf5-a574-4142-bc12-6d90901b68da
8d23e07f-46cc-4501-9848-fcd24df4fc49	bf2d43c7-b6e8-4ac5-a479-3079fb653abc	5a5d0351-27f7-4b07-986a-a326049d91d3
9f7f50d8-8e16-413b-9dca-f5f38e1b90a6	a3aa954a-1126-43bc-85e8-a4eadf0c280c	9089aa50-83ab-43e8-b19a-2dc2f74155c3
aedf76fa-c30e-4f41-b022-0aa104ce2c47	a3aa954a-1126-43bc-85e8-a4eadf0c280c	bf2d43c7-b6e8-4ac5-a479-3079fb653abc
b4cda6fc-d72a-4257-96b2-e659c4dff010	c9c5a37a-e5b1-4db8-b9ff-b8429c1d694e	f3ad050d-fc43-4f81-8cbf-cb6c32bb9f42
a706c226-3daa-4b8a-b380-2f333b9e2980	c162c813-1ed6-4c6a-84d1-f6fde501e894	f3ad050d-fc43-4f81-8cbf-cb6c32bb9f42
51464bfb-697c-4413-a940-a0bc60aeb6f8	54ccd557-f776-4dc5-8b2d-348286a47ba3	3a40c28d-12c2-40c4-a466-0371c2ef06f9
9fd8b235-6bb2-497f-9c85-dc91f4296b7a	4ecb05c1-2c32-478c-bd38-c6ab4e1d3781	bf2d43c7-b6e8-4ac5-a479-3079fb653abc
d60b0354-f801-477e-b57a-90685b42fd01	3314c7c4-3be0-4938-8f66-561c2ffde264	5a1abd9c-3152-4daf-ad94-ad7f7de345f8
80b1a788-1700-4f20-ba13-94820cd98b2d	1beac16e-5ed4-48c8-8fa7-de9fd0e5e97c	1beac16e-5ed4-48c8-8fa7-de9fd0e5e97c
0b19cc67-ae56-41d9-ba23-a9edc84965d9	e5a9d06a-1f03-450a-bccb-7be873337493	f3ad050d-fc43-4f81-8cbf-cb6c32bb9f42
bd16cf44-aecb-4e85-aaf5-1cab2b9aa430	f6fde819-4ffd-4abd-a691-9f1bcaed6668	c9c5a37a-e5b1-4db8-b9ff-b8429c1d694e
162187af-9d36-40dd-92c3-d0179ee001ca	f3ad050d-fc43-4f81-8cbf-cb6c32bb9f42	a3aa954a-1126-43bc-85e8-a4eadf0c280c
c08cd528-735f-4072-80d3-61b35a92580a	8428bec7-a00c-448c-967a-386ae169a501	5a5d0351-27f7-4b07-986a-a326049d91d3
a136e333-dab4-40b6-bed9-0beddd686898	5a5d0351-27f7-4b07-986a-a326049d91d3	54ccd557-f776-4dc5-8b2d-348286a47ba3
6b203b93-685a-4b2f-b57a-5908640fa2ee	e5a9d06a-1f03-450a-bccb-7be873337493	ce3d8470-16ae-451a-b8d8-994f86506d17
eba93380-2006-4ce9-b9a5-50a25b3a61df	c9c5a37a-e5b1-4db8-b9ff-b8429c1d694e	54ccd557-f776-4dc5-8b2d-348286a47ba3
\.


--
-- Data for Name: Label; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."Label" (id, name) FROM stdin;
59993ad8-7f1d-45bb-a4c0-21ff6cf48b29	macro-synteny
1fbf6852-9437-41d2-b2c6-28b8e7735c2c	micro-synteny
a33406f5-f827-4d72-9895-646968610d83	tree
\.


--
-- Data for Name: Scaffold; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."Scaffold" (id, name, length, "genomeId", "speciesId") FROM stdin;
e8200bc1-b227-4808-9c61-f61c05a80980	1	2000	46b7d55d-dde1-43a3-8a62-037bbe9f52c8	\N
141f96b1-9a6e-4077-831c-2d52fd37b37e	3	2000	46b7d55d-dde1-43a3-8a62-037bbe9f52c8	\N
d3cbc261-3cc2-4e9a-85a5-55142907e70b	1	1500	77c6c365-69b5-48b0-8a65-9d6bc6c2dec7	\N
581defb2-c769-44c9-98bf-1638758474c5	2	800	46b7d55d-dde1-43a3-8a62-037bbe9f52c8	\N
88b0e040-64e6-42c2-8491-c725cb13cc8c	2	1500	77c6c365-69b5-48b0-8a65-9d6bc6c2dec7	\N
\.


--
-- Data for Name: Segment; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."Segment" (id, name, start, "end", "scaffoldId") FROM stdin;
\.


--
-- Data for Name: Species; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."Species" (id, name, source, version, state) FROM stdin;
00ecbd39-fb6e-414c-ac8c-1ba5753759bd	human	ensembl	109	present
a7c40d81-f418-4961-b058-cfe75cb61c30	dog	ensembl	109	present
\.


--
-- Data for Name: TreeGene; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."TreeGene" ("treeId", "geneId") FROM stdin;
\.


--
-- Data for Name: TreeSpecies; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public."TreeSpecies" ("treeId", "speciesId") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: niezabil
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
53b2ddd8-1b48-4034-801e-bc2805a7b957	57c54a41ede1acec059cf073be6c5661dece0bc497fdb5e7923d439733b55762	2023-05-22 15:58:53.946403+01	20230522145853_asd	\N	\N	2023-05-22 15:58:53.904892+01	1
81b79baf-9178-459a-a5c0-d3faef92501d	85aaedc1e54df7a14dcb4d3c054289ad376f5d248068c972dae5354bc73eb13b	2023-05-23 11:27:57.605684+01	20230523102757_ghj	\N	\N	2023-05-23 11:27:57.60001+01	1
\.


--
-- Name: GeneLabel GeneLabel_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."GeneLabel"
    ADD CONSTRAINT "GeneLabel_pkey" PRIMARY KEY ("geneId", "labelId");


--
-- Name: GeneTree GeneTree_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."GeneTree"
    ADD CONSTRAINT "GeneTree_pkey" PRIMARY KEY (id);


--
-- Name: Gene Gene_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Gene"
    ADD CONSTRAINT "Gene_pkey" PRIMARY KEY (id);


--
-- Name: GenomeSource GenomeSource_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."GenomeSource"
    ADD CONSTRAINT "GenomeSource_pkey" PRIMARY KEY (id);


--
-- Name: GenomeState GenomeState_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."GenomeState"
    ADD CONSTRAINT "GenomeState_pkey" PRIMARY KEY (id);


--
-- Name: Genome Genome_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Genome"
    ADD CONSTRAINT "Genome_pkey" PRIMARY KEY (id);


--
-- Name: Homology Homology_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Homology"
    ADD CONSTRAINT "Homology_pkey" PRIMARY KEY (id);


--
-- Name: Label Label_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Label"
    ADD CONSTRAINT "Label_pkey" PRIMARY KEY (id);


--
-- Name: Scaffold Scaffold_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Scaffold"
    ADD CONSTRAINT "Scaffold_pkey" PRIMARY KEY (id);


--
-- Name: Segment Segment_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Segment"
    ADD CONSTRAINT "Segment_pkey" PRIMARY KEY (id);


--
-- Name: Species Species_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Species"
    ADD CONSTRAINT "Species_pkey" PRIMARY KEY (id);


--
-- Name: TreeGene TreeGene_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."TreeGene"
    ADD CONSTRAINT "TreeGene_pkey" PRIMARY KEY ("treeId", "geneId");


--
-- Name: TreeSpecies TreeSpecies_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."TreeSpecies"
    ADD CONSTRAINT "TreeSpecies_pkey" PRIMARY KEY ("treeId", "speciesId");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Species_name_key; Type: INDEX; Schema: public; Owner: niezabil
--

CREATE UNIQUE INDEX "Species_name_key" ON public."Species" USING btree (name);


--
-- Name: GeneLabel GeneLabel_geneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."GeneLabel"
    ADD CONSTRAINT "GeneLabel_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES public."Gene"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GeneLabel GeneLabel_labelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."GeneLabel"
    ADD CONSTRAINT "GeneLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES public."Label"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Gene Gene_scaffoldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Gene"
    ADD CONSTRAINT "Gene_scaffoldId_fkey" FOREIGN KEY ("scaffoldId") REFERENCES public."Scaffold"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Genome Genome_sourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Genome"
    ADD CONSTRAINT "Genome_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES public."GenomeSource"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Genome Genome_stateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Genome"
    ADD CONSTRAINT "Genome_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES public."GenomeState"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Homology Homology_queryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Homology"
    ADD CONSTRAINT "Homology_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES public."Gene"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Homology Homology_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Homology"
    ADD CONSTRAINT "Homology_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Gene"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Scaffold Scaffold_genomeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Scaffold"
    ADD CONSTRAINT "Scaffold_genomeId_fkey" FOREIGN KEY ("genomeId") REFERENCES public."Genome"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Scaffold Scaffold_speciesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Scaffold"
    ADD CONSTRAINT "Scaffold_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES public."Species"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Segment Segment_scaffoldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."Segment"
    ADD CONSTRAINT "Segment_scaffoldId_fkey" FOREIGN KEY ("scaffoldId") REFERENCES public."Scaffold"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TreeGene TreeGene_geneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."TreeGene"
    ADD CONSTRAINT "TreeGene_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES public."Gene"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TreeGene TreeGene_treeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."TreeGene"
    ADD CONSTRAINT "TreeGene_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES public."GeneTree"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TreeSpecies TreeSpecies_speciesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."TreeSpecies"
    ADD CONSTRAINT "TreeSpecies_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES public."Genome"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TreeSpecies TreeSpecies_treeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: niezabil
--

ALTER TABLE ONLY public."TreeSpecies"
    ADD CONSTRAINT "TreeSpecies_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES public."GeneTree"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: niezabil
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

