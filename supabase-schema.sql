-- =============================================================================
-- DOOMUTECH SÉNÉGAL — SCHÉMA SUPABASE (PostgreSQL + Row Level Security)
-- Couche 2 : Stockage des demandes de devis & sécurisation des accès
-- =============================================================================

create table if not exists public.demandes_devis (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Informations prospect
  nom_client text not null,
  telephone text not null,
  email text,
  ville_zone text not null,

  -- Qualification du besoin (Section 3 du cahier des charges)
  service_demande text not null,
  type_client text not null,
  nature_projet text not null,
  budget_envisage text default 'À définir après étude',
  description_besoin text,
  consentement_cdp boolean not null default true,

  -- Suivi commercial administrateur (Section 4 du cahier des charges)
  statut text not null default '01_nouveau'
    check (statut in ('01_nouveau', '02_a_qualifier', '03_etude_devis', '04_relance', '05_gagne', '05_perdu')),
  montant_devis numeric(14, 0) default 0,
  date_relance date,
  notes_commerciales text default ''
);

-- Activer la sécurité au niveau des lignes (RLS)
alter table public.demandes_devis enable row level security;

-- Règle 1 : Tout visiteur peut soumettre une demande de devis (INSERT uniquement)
-- Aucun visiteur anonyme ne peut lire (SELECT) les demandes des autres clients.
create policy "Insertion publique des demandes de devis"
  on public.demandes_devis
  for insert
  to anon
  with check (consentement_cdp = true);

-- Règle 2 : Seuls les administrateurs authentifiés DoomuTech peuvent lire, modifier ou supprimer
create policy "Lecture réservée aux administrateurs DoomuTech"
  on public.demandes_devis
  for select
  to authenticated
  using (true);

create policy "Mise à jour réservée aux administrateurs DoomuTech"
  on public.demandes_devis
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Suppression réservée aux administrateurs DoomuTech"
  on public.demandes_devis
  for delete
  to authenticated
  using (true);
