import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int a1 = sc.nextInt(), a2 = sc.nextInt(), a3 = sc.nextInt(), a4 = sc.nextInt();
        int m = a1;
        if (a2 > m) m = a2;
        if (a3 > m) m = a3;
        if (a4 > m) m = a4;
        System.out.print(m);
    }
}
