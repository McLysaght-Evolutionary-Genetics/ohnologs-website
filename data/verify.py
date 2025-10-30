
def validate_scafs():
  scafs = set()

  entries = []

  with open("scaffolds.tsv") as f:
    for line in f:
      line = line.rstrip()

      sp, scaf, _, _ = line.split("\t")

      key = f"{sp}__{scaf}"

      if key in scafs:
        print("duplicate scaf: " + key)

      scafs.add(key)

  with open("genes.tsv") as f:
    for line in f:
      line = line.rstrip("\n")

      target, scaffold, segment, family, gene, prot, start, end, pvc, pgc = line.split("\t")

      key = f"{target}__{scaffold}"

      if key not in scafs:
        print(key)
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

  with open("genes.tsv") as f:
    for line in f:
      line = line.rstrip("\n")

      target, scaffold, segment, family, gene, prot, start, end, pvc, pgc = line.split("\t")

      prots.add(prot)

  with open("gene_labels.tsv") as f:
    for line in f:
      line = line.rstrip()

      prot, _ = line.split("\t")

      if prot not in prots:
        print("invalid label: " + prot)

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

# TODO: website src link only ensembl
# TODO: no segment assigned :(
# TODO: ohnology: no 1r/2r :((
# TODO: blast abuse
if __name__ == "__main__":
  validate_scafs()
  validate_dups()
  validate_labels()
  validate_ohno()
  validate_trees()
  validate_synteny()
