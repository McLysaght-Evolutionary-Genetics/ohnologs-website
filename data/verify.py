
def validate_scafs():
  scafs = set()
  segs = set()

  entries = []

  with open("scaffolds.tsv") as f:
    for line in f:
      line = line.rstrip()

      sp, scaf, _, _ = line.split("\t")

      key = f"{sp}__{scaf}"

      if key in scafs:
        print("duplicate scaf: " + key)

      scafs.add(key)

  with open("segments.tsv") as f:
    for line in f:
      line = line.rstrip()

      sp, scaf, seg, _, _ = line.split("\t")

      key = f"{sp}__{scaf}__{seg}"

      if key in segs:
        print("duplicate seg: " + key)

      segs.add(key)

  with open("genes.tsv") as f:
    for line in f:
      line = line.rstrip("\n")

      target, scaffold, segment, family, gene, prot, start, end, pvc, pgc = line.split("\t")

      key_scaf = f"{target}__{scaffold}"
      key_seg = f"{target}__{scaffold}__{segment}"

      if key_scaf not in scafs:
        print(key_scaf)
        continue

      if segment != "" and key_seg not in segs:
        print(key_seg)
        continue

      entries.append((target, scaffold, segment, family, gene, prot, start, end, pvc, pgc))

  with open("genes.tsv", "w") as f:
    for target, scaffold, segment, family, gene, prot, start, end, pvc, pgc in entries:
      f.write(f"{target}\t{scaffold}\t{segment}\t{family}\t{gene}\t{prot}\t{start}\t{end}\t{pvc}\t{pgc}\n")

def validate_dups():
  genes = set()
  prots = set()

  dup_genes = set()
  dup_prots = set()

  entries = []

  with open("genes.tsv") as f:
    for line in f:
      line = line.rstrip("\n")

      target, scaffold, segment, family, gene, prot, start, end, pvc, pgc = line.split("\t")

      if gene in genes:
        print("duplicate gene: " + gene)
        dup_genes.add(gene)

      if prot in prots:
        print("duplciate prot: " + prot)
        dup_prots.add(prot)

      genes.add(gene)
      prots.add(prot)

      entries.append((target, scaffold, segment, family, gene, prot, start, end, pvc, pgc))

  with open("genes.tsv", "w") as f:
    for target, scaffold, segment, family, gene, prot, start, end, pvc, pgc in entries:
      n_gene = gene
      n_prot = prot

      if gene in dup_genes:
        n_gene = f"{target}__{gene}"

      if prot in dup_prots:
        n_prot = f"{target}__{prot}"

      f.write(f"{target}\t{scaffold}\t{segment}\t{family}\t{n_gene}\t{n_prot}\t{start}\t{end}\t{pvc}\t{pgc}\n")

def validate_labels():
  prots = set()

  entries = []

  with open("genes.tsv") as f:
    for line in f:
      line = line.rstrip("\n")

      target, scaffold, segment, family, gene, prot, start, end, pvc, pgc = line.split("\t")

      prots.add(prot)

  with open("gene_labels.tsv") as f:
    for line in f:
      line = line.rstrip()

      prot, label = line.split("\t")

      if prot not in prots:
        print("invalid label: " + prot)
        continue

      entries.append((prot, label))

  with open("gene_labels.tsv", "w") as f:
    for prot, label in entries:
      f.write(f"{prot}\t{label}\n")

def validate_ohno():
  prots = set()
  combs = set()

  entries = []

  with open("genes.tsv") as f:
    for line in f:
      line = line.rstrip("\n")

      target, scaffold, segment, family, gene, prot, start, end, pvc, pgc = line.split("\t")

      prots.add(prot)

  with open("gene_ohnology.tsv") as f:
    for line in f:
      line = line.rstrip()

      q, s, cat = line.split("\t")

      if q not in prots:
        print("invalid prot: " + q)
        continue

      if s not in prots:
        print("invalid prot: " + s)
        continue

      key = f"{q}__{s}"

      if key in combs:
        print("duplicate key: " + key)
        continue

      combs.add(key)
      entries.append((q, s, cat))

  with open("gene_ohnology.tsv", "w") as f:
    for q, s, cat in entries:
      f.write(f"{q}\t{s}\t{cat}\n")

def validate_trees():
  ogs = set()

  with open("trees.tsv") as f:
    for line in f:
      line = line.rstrip()

      og, treestr = line.split("\t")

      if og in ogs:
        print("duplicate og: " + og)
        continue

      ogs.add(og)

# <block:blockId, species:speciesId, scaffold:scaffoldId, group:groupId, gene:proteinId>
def validate_synteny():
  prots = set()

  entries = []

  with open("genes.tsv") as f:
    for line in f:
      line = line.rstrip("\n")

      target, scaffold, segment, family, gene, prot, start, end, pvc, pgc = line.split("\t")

      key = f"{scaffold}__{prot}"

      prots.add(key)

  with open("synteny_genes.tsv") as f:
    for line in f:
      line = line.rstrip()

      block, species, scaffold, group, protein = line.split("\t")

      key = f"{scaffold}__{protein}"

      if key not in prots:
        print("invalid block protein: " + key)
        continue

      entries.append((block, species, scaffold, group, protein))

  with open("synteny_genes.tsv", "w") as f:
    for block, species, scaffold, group, protein in entries:
      f.write(f"{block}\t{species}\t{scaffold}\t{group}\t{protein}\n")

# [DONE] TODO: website src link only ensembl
# [DONE] TODO: no segment assigned :(
# [DONE] TODO: ohnology: no 1r/2r :((
# [DONE] TODO: website copyright auto date pls
# TODO: blast abuse
# TODO: protecc admin route obv
# TODO: does download all link/downloads fuck up the site?
if __name__ == "__main__":
  validate_scafs()
  validate_dups()
  validate_labels()
  validate_ohno()
  validate_trees()
  validate_synteny()
