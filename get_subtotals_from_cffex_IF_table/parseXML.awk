#!/usr/bin/awk -f

BEGIN { 
	FS="[<|>]"
	tblName=""
	dataTypeId=0
	rank=0
	vol0=0
	varVol0=0
	vol1=0
	varVol1=0
	vol2=0
	varVol2=0
	tradingDay=""
	flag=1
	count=0
}

/instrumentId/	{
	tblName=$3
	if (index(tblName, "TF") > 0)	#we want IF only
		exit
}

/tradingDay/	{
	tradingDay=$3
	if (flag) {
		printf("%s\t", tradingDay) >> ARGV[2]
		flag=0
	}
}

/dataTypeId/	{
	dataTypeId=$3
}

/rank/	{
	rank=$3
}

/volume/	{
	value=$3
	if (dataTypeId==0) 
		vol0 = vol0+value
	else if (dataTypeId==1) 
		vol1 = vol1+value
	else if (dataTypeId==2) 
		vol2 = vol2+value

	if (rank==20) {
		if (dataTypeId==0) {
			# printf("%d\t", vol0) >> ARGV[2]
			values[1] = vol0
			count=count+1
			vol0 = 0
		}
		else if (dataTypeId==1) {
			# printf("%d\t", vol1) >> ARGV[2]
			values[3] = vol1
			count=count+1
			vol1 = 0
		}
		else if (dataTypeId==2) {
			# printf("%d\t", vol2) >> ARGV[2]
			values[5] = vol2
			count=count+1
			vol2 = 0
		}
	}
}

/varVolume/	{
	value=$3
	if (dataTypeId==0) 
		varVol0 = varVol0+value
	else if (dataTypeId==1) 
		varVol1 = varVol1+value
	else if (dataTypeId==2) 
		varVol2 = varVol2+value

	if (rank==20) {
		if (dataTypeId==0) {
			# printf("%d\t", varVol0) >> ARGV[2]
			values[2] = varVol0
			count=count+1
			varVol0 = 0
		}
		else if (dataTypeId==1) {
			# printf("%d\t", varVol1) >> ARGV[2]
			values[4] = varVol1
			count=count+1
			varVol1 = 0
		}
		else if (dataTypeId==2) {
			# printf("%d\t", varVol2) >> ARGV[2]
			values[6] = varVol2
			count=count+1
			varVol2 = 0
		}

		if (count==6) {
			printf("%d\t%d\t%d\t%d\t%d\t%d\t",values[1],values[2],values[3],values[4],values[5],values[6]) >> ARGV[2]
			count=0
		}
	}
}

END	{
	printf("\n") >> ARGV[2]
}
