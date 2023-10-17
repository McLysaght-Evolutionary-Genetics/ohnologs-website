library(GOfuncR)
library(dplyr)

genes<-read.delim2("r1.tsv", header = T)

out<-go_enrich(genes)
# results<-out$results

# over_rep<-results[results$raw_p_overrep<=0.05,]
# under_rep<-results[results$raw_p_underrep<=0.05,]

# print(out)


